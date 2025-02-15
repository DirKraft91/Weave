use chrono::{Duration, Utc};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use crate::services::models::{AuthError, Claims, TokenType, TokenPair};

pub struct JwtService;

impl JwtService {
     pub fn create_token_pair(signer: &str) -> Result<TokenPair, AuthError> {
        let access_token = Self::create_token(signer, Duration::hours(1), TokenType::Access)?;
        let refresh_token = Self::create_token(signer, Duration::days(30), TokenType::Refresh)?;

        Ok(TokenPair {
            access_token,
            refresh_token,
        })
    }

    fn create_token(
        signer: &str,
        duration: Duration,
        token_type: TokenType
    ) -> Result<String, AuthError> {
        let expiration = Utc::now()
            .checked_add_signed(duration)
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: signer.to_string(),
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

    pub fn verify_token(token: &str, expected_type: TokenType) -> Result<Claims, AuthError> {
        let secret_key = std::env::var("JWT_SECRET_KEY")
            .map_err(|_| AuthError::EnvVarError("JWT_SECRET_KEY must be set".to_string()))?;

        let claims = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret_key.as_bytes()),
            &Validation::default(),
        )
        .map_err(|e| AuthError::TokenValidationError(e.to_string()))?
        .claims;

        if std::mem::discriminant(&claims.token_type) != std::mem::discriminant(&expected_type) {
            return Err(AuthError::TokenValidationError("Invalid token type".to_string()));
        }

        Ok(claims)
    }

    pub fn extract_token(auth_header: &str) -> Result<Claims, AuthError> {
        let token = auth_header.strip_prefix("Bearer ")
            .ok_or_else(|| AuthError::TokenValidationError("Invalid authorization header format".to_string()))?;

        Self::verify_token(token, TokenType::Access)
    }
}
