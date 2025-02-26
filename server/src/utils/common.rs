use chrono::Utc;
use k256::sha2::{Digest, Sha256};

pub fn get_current_time() -> i64 {
    Utc::now().timestamp()
}

pub fn hash_bytes_sha256(data: Vec<u8>) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex::encode(result) // Convert to a hex string
}