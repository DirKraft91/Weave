use std::sync::Arc;
use axum::{extract::State, response::IntoResponse, Json, http::StatusCode};
use prism_prover::Prover;
use crate::api::dto::request::auth_req::AuthWalletRequestDto;
use crate::api::dto::response::auth_res::AuthWalletResponseDto;
use crate::services::auth_service::AuthService;
use crate::services::user_service::UserService;
use crate::utils::jwt::create_token;

pub async fn auth_wallet(
    State(prover): State<Arc<Prover>>,
    Json(body): Json<AuthWalletRequestDto>
) -> impl IntoResponse {
    if let Err(e) = AuthService::verify_wallet_signature(&body) {
        return e.into_response();
    }

    match UserService::new(prover, body.signer.clone()).create_user_account(body.signer.clone()).await {
        Ok(_) => match create_token(body.signer.clone()) {
            Ok(token) => (StatusCode::OK, Json(AuthWalletResponseDto { token })).into_response(),
            Err(e) => e.into_response(),
        },
        Err(e) => e.into_response(),
    }
}
