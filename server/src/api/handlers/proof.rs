use axum::{
    response::{ IntoResponse, Json as AxumJson },
    http as AxumHttp,
    Json,
    extract::State,
};
use prism_client::binary::ToBinary;
use serde_json::json;
use crate::{
    api::dto::request::proof_req::{ApplyProofRequestDto, PrepareToApplyProofRequestDto}, 
    domain::models::user::UserAminoSignedRecord, 
    entities::user::ProofEntity, 
    services::proof_service::ReclaimProofValidator, 
    utils::common::{get_current_time, hash_bytes_sha256}
};
use crate::entities::user_repo::UserRepo;
use crate::api::dto::response::proof_res::{PrepareToApplyProofResponseDto, ApplyProofResponseDto, AppliedProofStatsResponseDto};
use crate::services::proof_service::ProofService;
use crate::services::user_service::UserService;

use super::auth::AppState;


pub async fn prepare_to_apply_proof(
    Json(payload): Json<PrepareToApplyProofRequestDto>,
) -> impl IntoResponse {
    let proof_service = ProofService {
        data: payload.proof.clone(),
        provider_id: payload.provider_id.clone(),
        validator: ReclaimProofValidator,
    };
    let data_to_sign = match proof_service.validate_and_get_data_to_sign().await {
        Ok(data) => data,   
        Err(e) => return e.into_response(),
    };
    (AxumHttp::StatusCode::OK, AxumJson(
        PrepareToApplyProofResponseDto { data: data_to_sign, signer: payload.signer })
    ).into_response()
}

pub async fn apply_proof(
    State(state): State<AppState>,
    Json(payload): Json<ApplyProofRequestDto>,
) -> impl IntoResponse {
    let user_repo: UserRepo = state.user_repo;
    let user_service = UserService::new(state.prover, payload.signer.clone());
    let user_amino_signed_record = UserAminoSignedRecord::new(
        payload.public_key.clone(),
        payload.signature.clone(),
        payload.signer.clone(),
        payload.data.clone(),
    );

    match user_service.add_data_to_user_account(
        user_amino_signed_record.to_user_record()
    ).await {
        Ok(_) => {
            // add proof to db
            let proof_clone = payload.proof.clone();
            let raw_data = proof_clone.encode_to_bytes().unwrap();
            let raw_data_hash = hash_bytes_sha256(raw_data.clone());
            let created_at = get_current_time();
            let mut proof = ProofEntity {
                user_id: payload.signer.clone(),
                provider_id: payload.provider_id.clone(),
                created_at: created_at,
                raw_data: Some(raw_data.clone()),
                raw_data_hash: raw_data_hash.clone(),
            };

            // check if proof is already exists
            match user_repo.proof_exists_by_hash(&raw_data_hash) {
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
            
            match user_repo.insert_proof(&proof) {
                Ok(_) => println!("Proof created successfully"),
                Err(e) => eprintln!("Failed to insert proof: {}", e),
            }
            
            (AxumHttp::StatusCode::OK, AxumJson(ApplyProofResponseDto { success: true })).into_response()
        },
        Err(e) => e.into_response(),
    }
}


pub async fn get_applied_proof_stats(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let user_repo = state.user_repo;
    
    match user_repo.get_proof_stats_by_provider_id() {
        Ok(stats) => (
            AxumHttp::StatusCode::OK,
            AxumJson(AppliedProofStatsResponseDto { stats }),
        ).into_response(),
        Err(err) => (
            AxumHttp::StatusCode::INTERNAL_SERVER_ERROR,
            AxumJson(json!({ "error": err.to_string() })),
        ).into_response(),
    }
}