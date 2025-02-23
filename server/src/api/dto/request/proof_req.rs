use reclaim_rust_sdk::Proof as ReclaimProof;
use serde::{Deserialize, Serialize};
use crate::domain::models::proof::IdentityProvider;

#[derive(Deserialize, Serialize, Debug)]
pub struct ApplyProofRequestDto {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub data: ReclaimProof,
    #[serde(rename = "provider")]
    pub provider: IdentityProvider,
}