use chrono::Duration;
use server::{
    config::TokenConfig,
    services::{
        jwt::JwtService,
        models::TokenType,
    },
};

fn setup() -> JwtService {
    let config = TokenConfig {
        access_token_duration: Duration::hours(1),
        refresh_token_duration: Duration::days(30),
        jwt_secret: "test_secret_key".to_string(),
        refresh_threshold_minutes: 5,
    };
    JwtService::new(config)
}

#[test]
fn test_create_token_pair() {
    let service = setup();
    let user_id = "test_user";

    let result = service.create_token_pair(user_id);
    assert!(result.is_ok());

    let token_pair = result.unwrap();
    assert!(!token_pair.access_token.is_empty());
    assert!(!token_pair.refresh_token.is_empty());
}

#[test]
fn test_verify_token() {
    let service = setup();
    let user_id = "test_user";

    let token_pair = service.create_token_pair(user_id).unwrap();

    // Check access token
    let access_result = service.verify_token(&token_pair.access_token, TokenType::Access);
    assert!(access_result.is_ok());
    let access_claims = access_result.unwrap();
    assert_eq!(access_claims.sub, user_id);
    assert_eq!(access_claims.token_type, TokenType::Access);

    // Check refresh token
    let refresh_result = service.verify_token(&token_pair.refresh_token, TokenType::Refresh);
    assert!(refresh_result.is_ok());
    let refresh_claims = refresh_result.unwrap();
    assert_eq!(refresh_claims.sub, user_id);
    assert_eq!(refresh_claims.token_type, TokenType::Refresh);
}

#[test]
fn test_token_type_validation() {
    let service = setup();
    let user_id = "test_user";

    let token_pair = service.create_token_pair(user_id).unwrap();

    // Try using access token as refresh token
    let result = service.verify_token(&token_pair.access_token, TokenType::Refresh);
    assert!(result.is_err());

    // Try using refresh token as access token
    let result = service.verify_token(&token_pair.refresh_token, TokenType::Access);
    assert!(result.is_err());
}
