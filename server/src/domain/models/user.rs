use crate::domain::models::proof::IdentityRecord;

pub struct User {
    pub id: String,
    pub proofs: Vec<IdentityRecord>,
}

impl User {
    pub fn new(id: String, proofs: Vec<IdentityRecord>) -> Self {
        Self { id, proofs }
    }
}