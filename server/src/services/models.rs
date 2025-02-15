use serde::{Deserialize, Serialize};
use thiserror::Error;

// Authentication Payloads
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
    pub token_type: TokenType, // type of token
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub enum TokenType {
    Access,
    Refresh,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

#[derive(Serialize)]
pub struct SignInWalletResponse {
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Debug)]
pub struct AuthResult {
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Clone)]
pub struct AuthUser {
    pub user_id: String,  // from Claims.sub
}

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

impl axum::response::IntoResponse for AuthError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            AuthError::SignatureError(_) => (
                axum::http::StatusCode::UNAUTHORIZED,
                self.to_string(),
            ),
            AuthError::AccountCreationError(_) |
            AuthError::TokenGenerationError(_) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                self.to_string(),
            ),
            AuthError::TokenValidationError(_) |
            _ => (
                axum::http::StatusCode::BAD_REQUEST,
                self.to_string(),
            ),
        };

        (
            status,
            [(axum::http::header::CONTENT_TYPE, "application/json")],
            axum::Json(serde_json::json!({ "error": error_message })),
        ).into_response()
    }
}
