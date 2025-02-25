use reclaim_rust_sdk::Proof as ReclaimProof;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct PrepareToApplyProofRequestDto {
    pub proof: ReclaimProof,
    pub provider_id: String,
    pub signer: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ApplyProofRequestDto {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub data: String,
    pub proof: ReclaimProof,
    pub provider_id: String,
}
