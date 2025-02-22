use thiserror::Error;
use prism_client::{PrismApiError, TransactionError};

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Account not found {0}")]
    AccountNotFound(String),

    #[error("Key store error: {0}")]
    KeyStoreError(String),

    #[error("Signature error: {0}")]
    SignatureError(String),

    #[error("Transaction error: {0}")]
    TransactionError(String),
}

impl axum::response::IntoResponse for UserError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            UserError::AccountNotFound(_) => (
                axum::http::StatusCode::NOT_FOUND,
                self.to_string(),
            ),
            UserError::KeyStoreError(_) |
            UserError::SignatureError(_) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                self.to_string(),
            ),
            UserError::TransactionError(_) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
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

impl From<anyhow::Error> for UserError {
    fn from(error: anyhow::Error) -> Self {
        UserError::TransactionError(error.to_string())
    }
}

impl From<PrismApiError> for UserError {
    fn from(error: PrismApiError) -> Self {
        UserError::TransactionError(error.to_string())
    }
}

impl From<TransactionError> for UserError {
    fn from(error: TransactionError) -> Self {
        UserError::TransactionError(error.to_string())
    }
}
