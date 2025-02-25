use serde::Serialize;
use crate::domain::models::user::UserIdentityRecord;
#[derive(Serialize)]
pub struct UserDataResponseDto {
    pub id: String,
    pub identity_records: Vec<UserIdentityRecord>,
}

impl UserDataResponseDto {
    pub fn new(id: String, identity_records: Vec<UserIdentityRecord>) -> Self {
        Self { id, identity_records }
    }
} 