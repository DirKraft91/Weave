use serde::{Deserialize, Serialize};
use reclaim_rust_sdk::Proof as ReclaimProof;

use crate::domain::models::proof::IdentityProvider;

#[derive(Deserialize, Serialize)]
pub struct ApplyProofRequestDto {
    pub proof: ReclaimProof,
    #[serde(rename = "provider")]
    pub provider: IdentityProvider,
}