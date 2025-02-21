use std::time::{SystemTime, UNIX_EPOCH};
use k256::sha2::{Digest, Sha256};

pub fn get_current_time() -> i64 {
    // Get the current timestamp safely
    let created_at = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|d| d.as_secs() as i64)
    .unwrap_or_else(|_| panic!("SystemTime is before Unix epoch!"));
    created_at
}

pub fn hash_bytes_sha256(data: Vec<u8>) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex::encode(result) // Convert to a hex string
}