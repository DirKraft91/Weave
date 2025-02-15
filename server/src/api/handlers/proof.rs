use axum::{
    response::{ IntoResponse, Json as AxumJson },
    http as AxumHttp,
    Json,
    extract::{Extension, State},
};
use std::sync::Arc;
use prism_prover::Prover;
use crate::api::dto::request::proof_req::ApplyProofRequestDto;
use crate::api::dto::response::proof_res::ApplyProofResponseDto;
use crate::services::proof_service::ReclaimProofService;
use crate::services::user_service::UserService;
use crate::domain::models::auth::JwtUserPayload;

pub async fn add_proof(
    State(prover): State<Arc<Prover>>,
    Extension(jwt_user_payload): Extension<JwtUserPayload>,
    Json(payload): Json<ApplyProofRequestDto>,
) -> impl IntoResponse {
    let proof_service = ReclaimProofService {
        data: payload.proof,
        provider: payload.provider,
    };
    let data = match proof_service.validate_and_get_identity_record().await {
        Ok(data) => data,   
        Err(e) => return e.into_response(),
    };
    let user_service = UserService::new(prover, jwt_user_payload.clone().user_id);

    match user_service.add_data_to_user_account(data).await {
        Ok(_) => (AxumHttp::StatusCode::OK, AxumJson(ApplyProofResponseDto { success: true })).into_response(),
        Err(e) => e.into_response(),
    }
}
