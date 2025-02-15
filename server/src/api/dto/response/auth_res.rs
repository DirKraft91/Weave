use serde::Serialize;

#[derive(Serialize)]
pub struct AuthWalletResponseDto {
    pub success: bool,
}
