use serde::Serialize;

#[derive(Serialize)]
pub struct PrepareToApplyProofResponseDto {
    pub data: Vec<u8>,
    pub signer: String,
}

#[derive(Serialize)]
pub struct ApplyProofResponseDto {
    pub success: bool,
}

#[derive(Serialize)]
pub struct AppliedProofStatsResponseDto {
    pub stats: Vec<(String, i64)>,
}