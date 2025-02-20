use serde::Serialize;

#[derive(Serialize)]
pub struct AuthWalletResponseDto {
    pub success: bool,
    pub message: Option<String>,
    pub access_token: String,
    pub refresh_token: String,
}
