use std::env;
use chrono::Duration;

pub struct TokenConfig {
    pub access_token_duration: Duration,
    pub refresh_token_duration: Duration,
    pub jwt_secret: String,
    pub refresh_threshold_minutes: i64,  // For early token refresh
}

impl Default for TokenConfig {
    fn default() -> Self {
        Self {
            access_token_duration: Duration::hours(1),
            refresh_token_duration: Duration::days(30),
            jwt_secret: env::var("JWT_SECRET_KEY")
                .expect("JWT_SECRET_KEY must be set"),
            refresh_threshold_minutes: 5,
        }
    }
}

pub fn load_config() -> TokenConfig {
    TokenConfig {
        access_token_duration: Duration::hours(
            env::var("ACCESS_TOKEN_HOURS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(1)
        ),
        refresh_token_duration: Duration::days(
            env::var("REFRESH_TOKEN_DAYS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(30)
        ),
        jwt_secret: env::var("JWT_SECRET_KEY")
            .expect("JWT_SECRET_KEY must be set"),
        refresh_threshold_minutes: env::var("REFRESH_THRESHOLD_MINUTES")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(5),
    }
}
