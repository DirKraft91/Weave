use axum::{
    response::IntoResponse,
    Json,
    extract::{Extension, State},
    http::StatusCode,
};
use std::sync::Arc;
use prism_prover::Prover;
use crate::services::user_service::UserService;
use crate::domain::models::auth::JwtUserPayload;
use crate::api::dto::response::user_res::UserDataResponseDto;

pub async fn get_user(
    State(prover): State<Arc<Prover>>,
    Extension(jwt_user): Extension<JwtUserPayload>,
) -> impl IntoResponse {
    let user_service = UserService::new(prover, jwt_user.user_id);
    
    match user_service.get_user().await {
        Ok(user) => {
            (StatusCode::OK, Json(UserDataResponseDto {
                id: user.id,
                proofs: user.proofs
            })).into_response()
        }
        Err(e) => e.into_response(),
    }
}