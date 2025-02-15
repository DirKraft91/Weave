use chrono::{Duration, Utc};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use crate::services::models::{AuthError, Claims, TokenType, TokenPair};
use crate::config::TokenConfig;
use lazy_static::lazy_static;
use std::sync::Arc;

pub struct JwtService {
    config: TokenConfig,
}

lazy_static! {
    static ref JWT_SERVICE: Arc<JwtService> = Arc::new(JwtService::new(TokenConfig::default()));
}

impl JwtService {
    pub fn new(config: TokenConfig) -> Self {
        Self { config }
    }

    pub fn create_token_pair(&self, signer: &str) -> Result<TokenPair, AuthError> {
        let access_token = self.create_token(
            signer,
            self.config.access_token_duration,
            TokenType::Access
        )?;

        let refresh_token = self.create_token(
            signer,
            self.config.refresh_token_duration,
            TokenType::Refresh
        )?;

        Ok(TokenPair {
            access_token,
            refresh_token,
        })
    }

    fn create_token(
        &self,
        signer: &str,
        duration: Duration,
        token_type: TokenType,
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

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.config.jwt_secret.as_bytes()),
        )
        .map_err(|e| AuthError::TokenGenerationError(e.to_string()))
    }

    pub fn verify_token(&self, token: &str, expected_type: TokenType) -> Result<Claims, AuthError> {
        let claims = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.config.jwt_secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|e| AuthError::TokenValidationError(e.to_string()))?
        .claims;

        if std::mem::discriminant(&claims.token_type) != std::mem::discriminant(&expected_type) {
            return Err(AuthError::TokenValidationError("Invalid token type".to_string()));
        }

        Ok(claims)
    }

    pub fn instance() -> Arc<JwtService> {
        JWT_SERVICE.clone()
    }

    pub fn extract_token(auth_header: &str) -> Result<Claims, AuthError> {
        let token = auth_header.strip_prefix("Bearer ")
            .ok_or_else(|| AuthError::TokenValidationError("Invalid authorization header format".to_string()))?;

        Self::instance().verify_token(token, TokenType::Access)
    }
}
