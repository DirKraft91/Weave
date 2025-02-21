use axum::{
    response::{ IntoResponse, Json as AxumJson },
    http as AxumHttp,
    Json,
    extract::{Extension, State},
};
use crate::{api::dto::request::proof_req::ApplyProofRequestDto, entities::account::Proof, services::proof_service::ReclaimProofValidator, utils::common::get_current_time};
use crate::api::dto::response::proof_res::ApplyProofResponseDto;
use crate::services::proof_service::ProofService;
use crate::services::user_service::UserService;
use crate::domain::models::auth::JwtUserPayload;

use super::auth::AppState;

pub async fn add_proof(
    State(state): State<AppState>,
    Extension(jwt_user_payload): Extension<JwtUserPayload>,
    Json(payload): Json<ApplyProofRequestDto>,
) -> impl IntoResponse {
    let mut proof_clone = payload.proof.clone();
    let proof_service = ProofService {
        data: proof_clone,
        provider: payload.provider,
        validator: ReclaimProofValidator,
    };
    let data = match proof_service.validate_and_get_identity_record().await {
        Ok(data) => data,   
        Err(e) => return e.into_response(),
    };
    proof_clone = payload.proof.clone();
    let public_data = proof_clone.public_data;
    let identifier = proof_clone.identifier.to_string();
    let provider = proof_service.provider.to_string();
    let user_service = UserService::new(state.prover, jwt_user_payload.clone().user_id);
    let user_id = jwt_user_payload.clone().user_id;
    let account_repo: crate::entities::account_repo::AccountRepo = state.account_repo;

    match user_service.add_data_to_user_account(data).await {
        Ok(_) => {
            // add proof to db
            let created_at = get_current_time();
            let empty_public_data: Option<Vec<u8>> = None;
            let empty_raw_proof: Vec<u8> = Vec::new();
            let mut proof = Proof{
                email: "".to_string(),
                username: "".to_string(),
                created_at: created_at,
                account_id: user_id,
                provider: provider,
                public_data: empty_public_data,
                proof_identifier: identifier,
                raw_proof_hash: "".to_string(),
                raw_proof: empty_raw_proof,
            };
            proof.set_public_data(public_data);
            let proof_clone = payload.proof.clone();
            proof.set_raw_proof(&proof_clone);

            // check if proof is already exists
            match account_repo.proof_exists_by_hash(&proof.raw_proof_hash) {
                Ok(true) => {
                    return (AxumHttp::StatusCode::CONFLICT, AxumJson(ApplyProofResponseDto { success: false })).into_response();
                }
                Ok(false) => {
                    // Continue with proof insertion
                }
                Err(e) => {
                    return (AxumHttp::StatusCode::INTERNAL_SERVER_ERROR, AxumJson(ApplyProofResponseDto { success: false })).into_response();
                }
            }
            
            match account_repo.insert_proof(&proof) {
                Ok(_) => println!("Proof created successfully"),
                Err(e) => eprintln!("Failed to insert proof: {}", e),
            }
            
            (AxumHttp::StatusCode::OK, AxumJson(ApplyProofResponseDto { success: true })).into_response()
        },
        Err(e) => e.into_response(),
    }
}
