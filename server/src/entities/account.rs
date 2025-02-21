use reclaim_rust_sdk::{ Proof as ReclaimProof };
use serde::{Serialize, Deserialize};
use diesel::prelude::*;
use std::collections::HashMap;

use crate::{schema::{accounts, proofs}, utils::common::hash_bytes_sha256};

#[derive(Debug, Serialize, Deserialize, Insertable, Queryable, Identifiable)]
#[diesel(table_name = accounts)]
#[diesel(primary_key(id))]
pub struct Account {
    pub id: String, // signer
    pub public_key: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable, Associations)]
#[diesel(table_name = proofs)]
#[diesel(primary_key(proof_identifier))]
#[diesel(belongs_to(Account, foreign_key = account_id))]
pub struct Proof {
    pub proof_identifier: String,
    pub public_data: Option<Vec<u8>>,
    pub email: String,
    pub username: String,
    pub created_at: i64,
    pub provider: String,
    pub raw_proof: Vec<u8>, // Store raw bytes
    pub raw_proof_hash: String,
    pub account_id: String, // Foreign key
}

impl Proof {
    pub fn get_raw_proof(&self) -> Result<ReclaimProof, bincode::Error> {
        bincode::deserialize(&self.raw_proof)
    }

    pub fn get_public_data(&self) -> Result<HashMap<String, String>, bincode::Error> {
        match &self.public_data {
            Some(data) => bincode::deserialize(data),
            None => Ok(HashMap::new()), // Return an empty HashMap if `public_data` is None
        }
    }
        
    pub fn set_raw_proof(&mut self, proof: &ReclaimProof) -> Result<(), bincode::Error> {
        self.raw_proof = bincode::serialize(proof)?;
        self.raw_proof_hash = hash_bytes_sha256(self.raw_proof.clone());
        
        Ok(())
    }

    pub fn set_public_data(&mut self, public_data: Option<HashMap<String, String>>) -> Result<(), bincode::Error> {
        self.public_data = match public_data {
            Some(data) => Some(bincode::serialize(&data)?),
            None => None,
        };
        Ok(())
    }
}
