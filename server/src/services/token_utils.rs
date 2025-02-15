use chrono::{DateTime, Duration, Utc};
use base64::decode;
use serde_json::Value;
use crate::services::models::AuthError;

pub struct TokenUtils;

impl TokenUtils {
    pub fn is_token_expired(token: &str, buffer_minutes: i64) -> Result<bool, AuthError> {
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 3 {
            return Err(AuthError::TokenValidationError("Invalid token format".to_string()));
        }

        let payload = decode(parts[1])
            .map_err(|e| AuthError::TokenValidationError(e.to_string()))?;

        let claims: Value = serde_json::from_slice(&payload)
            .map_err(|e| AuthError::TokenValidationError(e.to_string()))?;

        let exp = claims["exp"].as_i64()
            .ok_or_else(|| AuthError::TokenValidationError("No expiration claim".to_string()))?;

        let expiration = DateTime::<Utc>::from_timestamp(exp, 0)
            .ok_or_else(|| AuthError::TokenValidationError("Invalid expiration timestamp".to_string()))?;

        let buffer = Duration::minutes(buffer_minutes);
        let current_time = Utc::now();

        Ok(current_time + buffer >= expiration)
    }

    pub fn should_refresh_token(access_token: &str) -> bool {
        // Check if the token is expired in the next 5 minutes
        match Self::is_token_expired(access_token, 5) {
            Ok(should_refresh) => should_refresh,
            Err(_) => true, // In case of an error, refresh the token
        }
    }
}
