use axum::{
    response::IntoResponse,
    http::{self as AxumHttp, StatusCode},
    Json,
    extract::State,
};
use chrono::{Duration as ChronoDuration, Utc};
use ecdsa::signature::DigestVerifier;
use jsonwebtoken::{encode, EncodingKey, Header, decode, DecodingKey, Validation};
use k256::sha2::{Digest, Sha256};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tendermint::PublicKey;
use thiserror::Error;
use crate::operations::create_account;
use prism_prover::Prover;
use std::sync::Arc;

// Custom Errors
#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Invalid signature: {0}")]
    SignatureError(String),

    #[error("Failed to create account: {0}")]
    AccountCreationError(String),

    #[error("Failed to generate token: {0}")]
    TokenGenerationError(String),

    #[error("Missing environment variable: {0}")]
    EnvVarError(String),

    #[error("Base64 decode error: {0}")]
    Base64Error(#[from] base64::DecodeError),

    #[error("Invalid public key")]
    PublicKeyError,

    #[error("Token validation error: {0}")]
    TokenValidationError(String),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            AuthError::SignatureError(_) => (
                StatusCode::UNAUTHORIZED,
                self.to_string()
            ),
            AuthError::AccountCreationError(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                self.to_string()
            ),
            AuthError::TokenGenerationError(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                self.to_string()
            ),
            AuthError::TokenValidationError(_) => (
                StatusCode::BAD_REQUEST,
                self.to_string()
            ),
            _ => (
                StatusCode::BAD_REQUEST,
                self.to_string()
            ),
        };

        (
            status,
            [(AxumHttp::header::CONTENT_TYPE, "application/json")],
            Json(serde_json::json!({
                "error": error_message
            }))
        ).into_response()
    }
}

// Types and DTOs
#[derive(Serialize, Deserialize)]
pub struct SignInWalletPayload {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // subject (address)
    pub exp: i64,     // expiration time
    pub iat: i64,     // issued at
}

#[derive(Serialize)]
struct SignInWalletResponse {
    auth: bool,
}

// Types for auth result
#[derive(Debug)]
pub struct AuthResult {
    pub token: String,
}

// JWT Service
pub struct JwtService;

impl JwtService {
    fn create_token(signer: &str) -> Result<String, AuthError> {
        let expiration = Utc::now()
            .checked_add_signed(ChronoDuration::hours(24))
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: signer.to_string(),
            exp: expiration,
            iat: Utc::now().timestamp(),
        };

        // let secret_key = std::env::var("JWT_SECRET_KEY")
        //     .map_err(|_| AuthError::EnvVarError("JWT_SECRET_KEY must be set".to_string()))?;
        let secret_key = "secret".to_string();

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret_key.as_bytes()),
        )
        .map_err(|e| AuthError::TokenGenerationError(e.to_string()))
    }

    pub fn decode_token(token: &str) -> Result<Claims, AuthError> {
        let secret_key = "secret".to_string();
        // let secret_key = std::env::var("JWT_SECRET_KEY")
        //     .map_err(|_| AuthError::EnvVarError("JWT_SECRET_KEY must be set".to_string()))?;

        decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret_key.as_bytes()),
            &Validation::default()
        )
        .map(|token_data| token_data.claims)
        .map_err(|e| AuthError::TokenValidationError(format!("Failed to decode token: {}", e)))
    }

    pub fn extract_token(auth_header: &str) -> Result<Claims, AuthError> {
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| AuthError::TokenValidationError("Invalid authorization header format".to_string()))?;

        Self::decode_token(token)
    }
}

// Signature Verification Service
struct SignatureService;

impl SignatureService {
    fn verify_signature(
        account_addr: &str,
        public_key: &str,
        signature: &str,
        data: &[u8],
    ) -> Result<(), AuthError> {
        let signature_bytes = base64::decode(signature)?;
        let rpc_signature_to_compare = hex::encode(signature_bytes);
        let signature = ecdsa::Signature::from_str(&rpc_signature_to_compare)
            .map_err(|e| AuthError::SignatureError(e.to_string()))?;

        let message = Self::generate_amino_message(account_addr, &base64::encode(data));
        let digest = Sha256::new_with_prefix(message);

        let pk = PublicKey::from_raw_secp256k1(
            base64::decode(public_key)?.as_slice()
        ).ok_or(AuthError::PublicKeyError)?;
        
        let vk = pk.secp256k1()
            .ok_or_else(|| AuthError::PublicKeyError)?;

        vk.verify_digest(digest, &signature)
            .map_err(|_| AuthError::SignatureError("Invalid signature".to_string()))
    }

    fn generate_amino_message(signer: &str, data: &str) -> String {
        format!(
            "{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\
            \"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\
            \"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}",
            data, signer
        )
    }
}

// Auth Service
struct AuthService;

impl AuthService {
    pub async fn sign_in_wallet(
        prover: Arc<Prover>,
        body: SignInWalletPayload,
    ) -> Result<AuthResult, AuthError> {
        // Verify signature
        SignatureService::verify_signature(
            &body.signer,
            &body.public_key,
            &body.signature,
            &body.message.as_bytes(),
        )?;

        // Create account
        create_account(body.signer.clone(), prover)
            .await
            .map_err(|e| AuthError::AccountCreationError(e.to_string()))?;

        // Generate JWT token
        let token = JwtService::create_token(&body.signer)?;
        
        Ok(AuthResult {
            token,
        })
    }
}

// HTTP Handler
pub async fn auth(
    State(prover): State<Arc<Prover>>,
    Json(body): Json<SignInWalletPayload>
) -> impl IntoResponse {
    match AuthService::sign_in_wallet(prover, body).await {
        Ok(result) => {
            let auth_header = format!("Bearer {}", result.token);
            let response = SignInWalletResponse { auth: true };
            
            (
                StatusCode::OK,
                [(AxumHttp::header::AUTHORIZATION, auth_header)],
                Json(response),
            ).into_response()
        },
        Err(e) => e.into_response(),
    }
}
