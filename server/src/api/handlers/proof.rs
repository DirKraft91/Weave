use axum::{
    response::{ IntoResponse, Json as AxumJson },
    http as AxumHttp,
    Json,
    extract::State,
};
use prism_client::binary::ToBinary;
use reclaim_rust_sdk::Proof as ReclaimProof;
use serde_json::json;
use crate::{
    api::dto::request::proof_req::ApplyProofRequestDto, 
    domain::models::user::UserAminoSignedRecord, 
    entities::account::Proof, 
    services::proof_service::ReclaimProofValidator, 
    utils::common::get_current_time
};
use crate::api::dto::response::proof_res::{ApplyProofResponseDto, ProofStatsResponseDto};
use crate::services::proof_service::ProofService;
use crate::services::user_service::UserService;

use super::auth::AppState;

pub async fn add_proof(
    State(state): State<AppState>,
    Json(payload): Json<ApplyProofRequestDto>,
) -> impl IntoResponse {
    let proof: ReclaimProof = payload.data;

    let proof_service = ProofService {
        data: proof.clone(),
        provider: payload.provider.clone(),
        validator: ReclaimProofValidator,
    };
    let identity_record = match proof_service.validate_and_get_identity_record().await {
        Ok(data) => data,   
        Err(e) => return e.into_response(),
    };
    let account_repo: crate::entities::account_repo::AccountRepo = state.account_repo;
    let user_service = UserService::new(state.prover, payload.signer.clone());
    let user_amino_signed_record = UserAminoSignedRecord::new(
        payload.public_key.clone(),
        payload.signature.clone(),
        payload.signer.clone(),
        base64::encode(proof.clone().encode_to_bytes().unwrap_or_default()),
    );

    match user_service.add_data_to_user_account(
        user_amino_signed_record.to_user_record()
    ).await {
        Ok(_) => {
            // add proof to db
            let proof_clone = proof.clone();
            let public_data = proof_clone.public_data.clone();
            let identifier = proof_clone.identifier.to_string();
            let provider = payload.provider.clone().to_string();
            let created_at = get_current_time();
            let empty_public_data: Option<Vec<u8>> = None;
            let empty_raw_proof: Vec<u8> = Vec::new();
            let mut proof = Proof{
                email: "".to_string(),
                username: "".to_string(),
                created_at: created_at,
                account_id: payload.signer.clone(),
                provider: provider,
                public_data: empty_public_data,
                proof_identifier: identifier,
                raw_proof_hash: "".to_string(),
                raw_proof: empty_raw_proof,
            };
            proof.set_public_data(public_data);
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


pub async fn get_proof_stats(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let account_repo = state.account_repo;
    
    match account_repo.get_proof_stats_by_provider() {
        Ok(stats) => (
            AxumHttp::StatusCode::OK,
            AxumJson(ProofStatsResponseDto { stats }),
        ).into_response(),
        Err(err) => (
            AxumHttp::StatusCode::INTERNAL_SERVER_ERROR,
            AxumJson(json!({ "error": err.to_string() })),
        ).into_response(),
    }
}