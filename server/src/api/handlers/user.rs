use axum::{
    extract::{Extension, Path, State}, http::StatusCode, response::IntoResponse, Json
};
use crate::services::user_service::UserService;
use crate::domain::models::auth::JwtUserPayload;
use crate::api::dto::response::user_res::UserDataResponseDto;

use super::auth::AppState;

pub async fn get_user(
    State(state): State<AppState>,
    Path(user_id): Path<String>, // Extract user_id from the URL path
) -> impl IntoResponse {
    let user_service = UserService::new(state.prover, user_id);

    match user_service.get_user().await {
        Ok(user) => {
            (StatusCode::OK, Json(UserDataResponseDto {
                id: user.id,
                proofs: user.proofs,
            })).into_response()
        }
        Err(e) => e.into_response(),
    }
}

pub async fn get_me(
    State(state): State<AppState>,
    Extension(jwt_user): Extension<JwtUserPayload>,
) -> impl IntoResponse {
    let user_service = UserService::new(state.prover, jwt_user.user_id);
    
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