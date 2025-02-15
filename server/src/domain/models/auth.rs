use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtUserPayload {
    pub user_id: String,
}

impl JwtUserPayload {
    pub fn new(user_id: String) -> Self {
        Self { user_id }
    }
}