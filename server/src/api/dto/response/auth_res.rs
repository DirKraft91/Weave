use serde::Serialize;

#[derive(Serialize)]
pub struct AuthWalletResponseDto {
    pub token: String,
}