use reclaim_rust_sdk::{ Proof as ReclaimProof };
use serde::{Serialize, Deserialize};
use diesel::prelude::*;

use crate::{schema::{proofs, users}, utils::common::hash_bytes_sha256};

#[derive(Insertable, Queryable, Selectable)]
#[diesel(table_name = users)]
pub struct UserEntity {
    pub id: String, // signer
    pub public_key: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable, Associations, Selectable)]
#[diesel(table_name = proofs)]
#[diesel(primary_key(provider_id, user_id))]
#[diesel(belongs_to(UserEntity, foreign_key = user_id))]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct ProofEntity {
    pub provider_id: String,
    pub user_id: String,
    pub raw_data: Option<Vec<u8>>,
    pub raw_data_hash: String,
    pub created_at: i64
}

impl ProofEntity {
    pub fn get_raw_data(&self) -> Result<ReclaimProof, bincode::Error> {
        bincode::deserialize(self.raw_data.as_ref().unwrap())
    }
        
    pub fn set_raw_proof(&mut self, proof: &ReclaimProof) -> Result<(), bincode::Error> {
        self.raw_data = Some(bincode::serialize(proof)?);
        self.raw_data_hash = hash_bytes_sha256(self.raw_data.as_ref().unwrap().clone());
        Ok(())
    }
}
