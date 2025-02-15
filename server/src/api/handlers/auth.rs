use std::sync::Arc;
use axum::{
    extract::State,
    response::{IntoResponse, Response},
    Json,
    http::{StatusCode, HeaderMap, header},
};
use prism_prover::Prover;
use serde_json::json;
use crate::api::dto::request::auth_req::AuthWalletRequestDto;
use crate::api::dto::response::auth_res::AuthWalletResponseDto;
use crate::services::auth_service::AuthService;
use crate::services::user_service::UserService;
use crate::utils::jwt::{create_access_token, create_refresh_token, decode_token, TokenType};
use axum::extract::TypedHeader;
use headers::Cookie;
use chrono::Utc;

pub async fn auth_wallet(
    State(prover): State<Arc<Prover>>,
    Json(body): Json<AuthWalletRequestDto>
) -> Response {
    if let Err(e) = AuthService::verify_wallet_signature(&body) {
        return e.into_response();
    }

    match UserService::new(prover, body.signer.clone()).create_user_account(body.signer.clone()).await {
        Ok(_) => {
            let access_token = match create_access_token(body.signer.clone()) {
                Ok(token) => token,
                Err(e) => return e.into_response(),
            };

            let refresh_token = match create_refresh_token(body.signer) {
                Ok(token) => token,
                Err(e) => return e.into_response(),
            };

            let mut headers = HeaderMap::new();
            // Set refresh token (httpOnly, secure)
            headers.insert(
                header::SET_COOKIE,
                format!(
                    "refresh_token={}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict",
                    refresh_token
                ).parse().unwrap()
            );
            // Set access token (JavaScript accessible)
            headers.insert(
                header::SET_COOKIE,
                format!(
                    "access_token={}; Path=/; Max-Age=900; SameSite=Strict",
                    access_token
                ).parse().unwrap()
            );

            (
                StatusCode::OK,
                headers,
                Json(AuthWalletResponseDto { success: true })
            ).into_response()
        },
        Err(e) => e.into_response(),
    }
}

pub async fn refresh_tokens(
    TypedHeader(cookies): TypedHeader<Cookie>,
) -> Response {
    // Get refresh token from cookies
    let refresh_token = match cookies.get("refresh_token") {
        Some(token) => token,
        None => return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "No refresh token provided" }))
        ).into_response(),
    };

    // Verify refresh token and get claims
    let claims = match decode_token(refresh_token.to_string()) {
        Ok(claims) => claims,
        Err(_) => return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Invalid refresh token" }))
        ).into_response(),
    };

    // Check if the last login was too long ago
    let last_activity = claims.iat;
    let current_time = Utc::now().timestamp();
    let max_inactivity = 30 * 24 * 60 * 60; // 30 days in seconds

    if current_time - last_activity > max_inactivity {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "error": "Session expired due to inactivity",
                "code": "INACTIVITY_TIMEOUT"
            }))
        ).into_response();
    }

    // Verify token type
    if !matches!(claims.token_type, TokenType::Refresh) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Invalid token type" }))
        ).into_response();
    }

    // Generate new tokens
    let new_access_token = match create_access_token(claims.sub.clone()) {
        Ok(token) => token,
        Err(e) => return e.into_response(),
    };

    let new_refresh_token = match create_refresh_token(claims.sub) {
        Ok(token) => token,
        Err(e) => return e.into_response(),
    };

    // Create headers for new tokens
    let mut headers = HeaderMap::new();
    // Set refresh token
    headers.insert(
        header::SET_COOKIE,
        format!(
            "refresh_token={}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict",
            new_refresh_token
        ).parse().unwrap()
    );
    // Set access token
    headers.insert(
        header::SET_COOKIE,
        format!(
            "access_token={}; Path=/; Max-Age=900; SameSite=Strict",
            new_access_token
        ).parse().unwrap()
    );

    // Return success response
    (
        StatusCode::OK,
        headers,
        Json(AuthWalletResponseDto { success: true })
    ).into_response()
}
