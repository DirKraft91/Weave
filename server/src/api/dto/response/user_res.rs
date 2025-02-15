use serde::Serialize;
use crate::domain::models::proof::IdentityRecord;

#[derive(Serialize)]
pub struct UserDataResponseDto {
    pub id: String,
    pub proofs: Vec<IdentityRecord>,
}

impl UserDataResponseDto {
    pub fn new(id: String, proofs: Vec<IdentityRecord>) -> Self {
        Self { id, proofs }
    }
} 