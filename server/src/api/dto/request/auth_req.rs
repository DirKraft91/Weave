use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AuthWalletRequestDto {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub data: String,
}