use diesel::prelude::*;
use crate::schema::{users, proofs};
use crate::entities::user::{UserEntity, ProofEntity};
use std::sync::{Arc, Mutex};
use diesel::mysql::MysqlConnection;
use anyhow::Result; // For better error handling


#[derive(Clone)]
pub struct UserRepo {
    pub conn: Arc<Mutex<MysqlConnection>>, // Thread-safe shared connection
}

impl UserRepo {
    pub fn new(conn: MysqlConnection) -> Self {
        UserRepo {
            conn: Arc::new(Mutex::new(conn)), // Move connection into Arc<Mutex<>>
        }
    }

    pub fn insert_user(&self, user: &UserEntity) -> Result<usize> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        diesel::insert_into(users::table)
            .values(user)
            .execute(&mut *conn) // Use &mut *conn
            .map_err(|e| e.into())
    }
    
    pub fn insert_proof(&self, proof: &ProofEntity) -> Result<usize> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        diesel::insert_into(proofs::table)
            .values(proof)
            .execute(&mut *conn) // Use &mut *conn
            .map_err(|e| e.into())
    }
    
    pub fn get_user(&self, user_id: &str) -> Result<Option<UserEntity>> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        users::table
            .filter(users::id.eq(user_id))
            .first::<UserEntity>(&mut *conn) // Use &mut *conn
            .optional()
            .map_err(|e| e.into())
    }

    pub fn proof_exists_by_hash(&self, hash: &str) -> Result<bool> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        let exists = diesel::select(diesel::dsl::exists(
            proofs::table.filter(proofs::raw_data_hash.eq(hash)),
        ))
        .get_result::<bool>(&mut *conn)?; // Execute query and return boolean

        Ok(exists)
    }
    
    pub fn get_proofs_by_user(&self, user_id: &str) -> Result<Vec<ProofEntity>> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        proofs::table
            .filter(proofs::user_id.eq(user_id))
            .load::<ProofEntity>(&mut *conn)
            .map_err(|e| e.into())
    }

    pub fn get_proof_stats_by_provider_id(&self) -> Result<Vec<(String, i64)>> {
        use diesel::dsl::*;
        use diesel::prelude::*;
    
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        
        proofs::table
            .group_by(proofs::provider_id) // Ensure provider is grouped
            .select((proofs::provider_id, count(proofs::user_id))) // Select provider and count of proofs
            .load::<(String, i64)>(&mut *conn) // Execute query
            .map_err(|e| e.into())
    }
    
}
