use thiserror::Error;
use prism_client::TransactionError;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Key store error: {0}")]
    KeyStoreError(String),

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

    #[error("Failed to prepare auth data: {0}")]
    PrepareAuthDataError(String),
}

impl axum::response::IntoResponse for AuthError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
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

impl From<TransactionError> for AuthError {
    fn from(error: TransactionError) -> Self {
        AuthError::PrepareAuthDataError(error.to_string())
    }
}
