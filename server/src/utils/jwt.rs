use serde::{Deserialize, Serialize};
use chrono::{Duration as ChronoDuration, Utc};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use crate::domain::errors::auth_errors::AuthError;

// Access token lifetime in minutes
const ACCESS_TOKEN_LIFETIME_MINUTES: i64 = 15;
// Refresh token lifetime in days
const REFRESH_TOKEN_LIFETIME_DAYS: i64 = 7;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // subject (address)
    pub exp: i64,     // expiration time
    pub iat: i64,     // issued at
    pub token_type: TokenType,  // type of token
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TokenType {
    Access,
    Refresh,
}

fn create_token_internal(signer: String, token_type: TokenType) -> Result<String, AuthError> {
    let expiration = Utc::now()
        .checked_add_signed(match token_type {
            TokenType::Access => ChronoDuration::minutes(ACCESS_TOKEN_LIFETIME_MINUTES),
            TokenType::Refresh => ChronoDuration::days(REFRESH_TOKEN_LIFETIME_DAYS),
        })
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: signer,
        exp: expiration,
        iat: Utc::now().timestamp(),
        token_type,
    };

    let secret_key = std::env::var("JWT_SECRET_KEY")
        .map_err(|_| AuthError::EnvVarError("JWT_SECRET_KEY must be set".to_string()))?;

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret_key.as_bytes()),
    )
    .map_err(|e| AuthError::TokenGenerationError(e.to_string()))
}

pub fn create_access_token(signer: String) -> Result<String, AuthError> {
    create_token_internal(signer, TokenType::Access)
}

pub fn create_refresh_token(signer: String) -> Result<String, AuthError> {
    create_token_internal(signer, TokenType::Refresh)
}

pub fn decode_token(token: String) -> Result<Claims, AuthError> {
    let secret_key = std::env::var("JWT_SECRET_KEY")
        .map_err(|_| AuthError::EnvVarError("JWT_SECRET_KEY must be set".to_string()))?;

    decode::<Claims>(
        &token,
        &DecodingKey::from_secret(secret_key.as_bytes()),
        &Validation::default(),
    )
    .map(|token_data| token_data.claims)
    .map_err(|e| AuthError::TokenValidationError(format!("Failed to decode token: {}", e)))
}

pub fn extract_token(auth_header: &str) -> Result<Claims, AuthError> {
    let token = auth_header.strip_prefix("Bearer ")
        .ok_or_else(|| AuthError::TokenValidationError("Invalid authorization header format".to_string()))?;
    decode_token(token.to_string())
}
