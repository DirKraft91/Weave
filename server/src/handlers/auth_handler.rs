use std::sync::Arc;
use axum::{extract::State, response::IntoResponse, Json, http::StatusCode};
use crate::services::{
    auth::AuthService,
    jwt::JwtService,
    models::{
        SignInWalletPayload,
        SignInWalletResponse,
        RefreshTokenRequest,
        TokenType
    }
};
use prism_prover::Prover;

pub async fn auth(
    State(prover): State<Arc<Prover>>,
    Json(body): Json<SignInWalletPayload>
) -> impl IntoResponse {
    match AuthService::sign_in_wallet(prover, body).await {
          Ok(result) => {
            (StatusCode::OK, Json(SignInWalletResponse {
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            })).into_response()
        }
        Err(e) => e.into_response(),
    }
}

pub async fn refresh_token(
    Json(payload): Json<RefreshTokenRequest>,
) -> impl IntoResponse {
    match JwtService::instance().verify_token(&payload.refresh_token, TokenType::Refresh) {
        Ok(claims) => {
            match JwtService::instance().create_token_pair(&claims.sub) {
                Ok(token_pair) => {
                    (StatusCode::OK, Json(SignInWalletResponse {
                        access_token: token_pair.access_token,
                        refresh_token: token_pair.refresh_token,
                    })).into_response()
                }
                Err(e) => e.into_response(),
            }
        }
        Err(e) => e.into_response(),
    }
}
