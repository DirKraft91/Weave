use serde::Serialize;
use crate::domain::models::proof::IdentityRecord;

#[derive(Serialize)]
pub struct UserDataResponseDto {
    pub id: String,
    pub identity_records: Vec<IdentityRecord>,
}

impl UserDataResponseDto {
    pub fn new(id: String, identity_records: Vec<IdentityRecord>) -> Self {
        Self { id, identity_records }
    }
} 