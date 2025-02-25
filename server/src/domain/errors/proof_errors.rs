use thiserror::Error;

#[derive(Debug, Error)]
pub enum ProofError {
    #[error("Proof verification failed: {0}")]
    ProofNotVerifiedError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),
}

impl axum::response::IntoResponse for ProofError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            ProofError::ProofNotVerifiedError(_) => (
                axum::http::StatusCode::BAD_REQUEST,
                self.to_string(),
            ),
            ProofError::SerializationError(_) => (
                axum::http::StatusCode::BAD_REQUEST,
                self.to_string(),
            ),
            _ => (
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

impl From<serde_json::Error> for ProofError {
    fn from(error: serde_json::Error) -> Self {
        ProofError::SerializationError(error.to_string())
    }
}
