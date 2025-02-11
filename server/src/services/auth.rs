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
use std::fmt::Error;
use std::str::FromStr;
use tendermint::PublicKey;
use crate::operations::create_account;
use prism_prover::Prover;
use std::sync::Arc;

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

// JWT Service
pub struct JwtService;

impl JwtService {
    fn create_token(signer: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiration = Utc::now()
            .checked_add_signed(ChronoDuration::hours(24))
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: signer.to_string(),
            exp: expiration,
            iat: Utc::now().timestamp(),
        };

        let secret_key = std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret_key.as_bytes()),
        )
    }

    pub fn verify_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        let secret_key = std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");

        decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret_key.as_bytes()),
            &Validation::default(),
        ).map(|token_data| token_data.claims)
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
    ) -> Result<(), Error> {
        let rpc_signature_to_compare = hex::encode(base64::decode(&signature).unwrap());
        let signature = ecdsa::Signature::from_str(&rpc_signature_to_compare).unwrap();

        let message = Self::generate_amino_message(account_addr, &base64::encode(data));
        let digest = Sha256::new_with_prefix(message);

        let pk = PublicKey::from_raw_secp256k1(
            base64::decode(public_key).unwrap().as_slice()
        ).unwrap();
        let vk = pk.secp256k1().unwrap();

        vk.verify_digest(digest, &signature).map_err(|_| Error)
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
pub struct AuthService;

impl AuthService {
    pub async fn sign_in_wallet(
        body: SignInWalletPayload,
        prover: Arc<Prover>
    ) -> impl IntoResponse {
        // Verify signature
        if let Err(e) = SignatureService::verify_signature(
            &body.signer,
            &body.public_key,
            &body.signature,
            &body.message.as_bytes(),
        ) {
            return (
                StatusCode::UNAUTHORIZED,
                [(AxumHttp::header::WWW_AUTHENTICATE, "Bearer")],
                format!("{}", e),
            ).into_response();
        }

        // Create account
        if let Err(e) = create_account(body.signer.clone(), prover).await {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(e.to_string())
            ).into_response();
        }

        // Generate JWT token
        match JwtService::create_token(&body.signer) {
            Ok(token) => {
                let auth_header = format!("Bearer {}", token);
                let response = SignInWalletResponse { auth: true };

                (
                    StatusCode::OK,
                    [(AxumHttp::header::AUTHORIZATION, auth_header)],
                    Json(response),
                ).into_response()
            },
            Err(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json("Failed to create token".to_string()),
            ).into_response(),
        }
    }
}

// Handlers and Middleware
pub async fn auth(
    State(prover): State<Arc<Prover>>,
    Json(body): Json<SignInWalletPayload>
) -> impl IntoResponse {
    AuthService::sign_in_wallet(body, prover).await
}
