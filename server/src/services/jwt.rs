use chrono::{Duration as ChronoDuration, Utc};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use crate::services::models::{AuthError, Claims};

pub struct JwtService;

impl JwtService {
    pub fn create_token(signer: &str) -> Result<String, AuthError> {
        let expiration = Utc::now()
            .checked_add_signed(ChronoDuration::hours(24))
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: signer.to_string(),
            exp: expiration,
            iat: Utc::now().timestamp(),
        };

        // let secret_key = std::env::var("JWT_SECRET_KEY")
        //     .map_err(|_| AuthError::EnvVarError("JWT_SECRET_KEY must be set".to_string()))?;
        let secret_key = "secret".to_string();

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret_key.as_bytes()),
        )
        .map_err(|e| AuthError::TokenGenerationError(e.to_string()))
    }

    pub fn decode_token(token: &str) -> Result<Claims, AuthError> {
        let secret_key = "secret".to_string();

        decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret_key.as_bytes()),
            &Validation::default(),
        )
        .map(|token_data| token_data.claims)
        .map_err(|e| AuthError::TokenValidationError(format!("Failed to decode token: {}", e)))
    }

    pub fn extract_token(auth_header: &str) -> Result<Claims, AuthError> {
        let token = auth_header.strip_prefix("Bearer ")
            .ok_or_else(|| AuthError::TokenValidationError("Invalid authorization header format".to_string()))?;

        Self::decode_token(token)
    }
}
