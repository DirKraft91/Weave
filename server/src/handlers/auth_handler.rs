use std::sync::Arc;
use axum::{extract::State, response::IntoResponse, Json, http::StatusCode};
use crate::services::{auth::AuthService, models::{SignInWalletPayload, SignInWalletResponse}};
use prism_prover::Prover;

pub async fn auth(
    State(prover): State<Arc<Prover>>,
    Json(body): Json<SignInWalletPayload>
) -> impl IntoResponse {
    match AuthService::sign_in_wallet(prover, body).await {
        Ok(result) => (StatusCode::OK, Json(SignInWalletResponse { token: result.token })).into_response(),
        Err(e) => e.into_response(),
    }
}
