use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthWalletRequestDto {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub data: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PrepareAuthDataRequestDto {
    pub public_key: String,
    pub signer: String,
}