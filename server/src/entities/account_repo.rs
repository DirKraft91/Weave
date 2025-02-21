use diesel::prelude::*;
use crate::schema::{accounts, proofs};
use crate::entities::account::{Account, Proof};
use std::sync::{Arc, Mutex};
use diesel::mysql::MysqlConnection;
use anyhow::Result; // For better error handling


#[derive(Clone)]
pub struct AccountRepo {
    pub conn: Arc<Mutex<MysqlConnection>>, // Thread-safe shared connection
}

impl AccountRepo {
    pub fn new(conn: MysqlConnection) -> Self {
        AccountRepo {
            conn: Arc::new(Mutex::new(conn)), // Move connection into Arc<Mutex<>>
        }
    }

    pub fn insert_account(&self, account: &Account) -> Result<usize> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        diesel::insert_into(accounts::table)
            .values(account)
            .execute(&mut *conn) // Use &mut *conn
            .map_err(|e| e.into())
    }
    
    pub fn insert_proof(&self, proof: &Proof) -> Result<usize> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        diesel::insert_into(proofs::table)
            .values(proof)
            .execute(&mut *conn) // Use &mut *conn
            .map_err(|e| e.into())
    }
    
    pub fn get_account(&self, account_id: &str) -> Result<Option<Account>> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        accounts::table
            .filter(accounts::id.eq(account_id))
            .first::<Account>(&mut *conn) // Use &mut *conn
            .optional()
            .map_err(|e| e.into())
    }

    pub fn proof_exists_by_hash(&self, hash: &str) -> Result<bool> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        let exists = diesel::select(diesel::dsl::exists(
            proofs::table.filter(proofs::raw_proof_hash.eq(hash)),
        ))
        .get_result::<bool>(&mut *conn)?; // Execute query and return boolean

        Ok(exists)
    }
    
    pub fn get_proofs_by_account(&self, account_id: &str) -> Result<Vec<Proof>> {
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        proofs::table
            .filter(proofs::account_id.eq(account_id))
            .load::<Proof>(&mut *conn) // Use &mut *conn
            .map_err(|e| e.into())
    }

    pub fn get_proof_stats_by_provider(&self) -> Result<Vec<(String, i64)>> {
        use diesel::dsl::*;
        use diesel::prelude::*;
    
        let mut conn = self.conn.lock().map_err(|e| anyhow::anyhow!("Failed to lock DB connection: {}", e))?;
        
        proofs::table
            .group_by(proofs::provider) // Ensure provider is grouped
            .select((proofs::provider, count(proofs::proof_identifier))) // Select provider and count of proofs
            .load::<(String, i64)>(&mut *conn) // Execute query
            .map_err(|e| e.into())
    }
    
}
