use serde::Serialize;

#[derive(Serialize)]
pub struct ApplyProofResponseDto {
    pub success: bool,
}
#[derive(Serialize)]
pub struct ProofStatsResponseDto {
    pub stats: Vec<(String, i64)>,
}