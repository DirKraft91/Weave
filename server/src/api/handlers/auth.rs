use std::sync::Arc;
use axum::{
    extract::State,
    response::{IntoResponse, Response},
    Json,
    http::{StatusCode, HeaderMap},
};
use prism_prover::Prover;
use serde_json::json;
use crate::{
    api::dto::request::auth_req::{
        PrepareAuthRequestDto, 
        AuthWalletRequestDto
    },
    domain::models::user::UserAminoSignedRecord, 
    entities::{
        account::Account as AccountEntity, 
        account_repo::AccountRepo
    }, 
    services::auth_service::AuthService,
    utils::common::get_current_time
};
use crate::api::dto::response::auth_res::{ AuthWalletResponseDto, PrepareAuthDataResponseDto };
use crate::services::user_service::UserService;
use crate::utils::jwt::{create_access_token, create_refresh_token, decode_token, TokenType};
use chrono::Utc;
use log::debug;

#[derive(Clone)]
pub struct AppState {
    pub prover: Arc<Prover>,
    pub account_repo: AccountRepo,
}

pub async fn prepare_auth_data (
    State(state): State<AppState>,
    Json(body): Json<PrepareAuthRequestDto>
) -> Response {
    let auth_service = AuthService::new(state.prover);
    let signer = body.signer.clone();
    let prepared_auth_data = auth_service.prepare_auth_data(body.signer, body.public_key);

    match prepared_auth_data {
        Ok(data) => {
            (StatusCode::OK, Json(PrepareAuthDataResponseDto {
                data: data.data,
                signer,
            })).into_response()
        }
        Err(e) => e.into_response(),
    }
}

pub async fn auth_wallet(
    State(state): State<AppState>,
    Json(body): Json<AuthWalletRequestDto>
) -> Response {
    let user_amino_signed_record = UserAminoSignedRecord::new(
        body.public_key.clone(), 
        body.signature.clone(), 
        body.signer.clone(), 
        body.data.clone()
    );
    let user_record = user_amino_signed_record.to_user_record();
    let data = user_record.user_data.clone();
    let signature = user_record.signature_bundle.signature.clone();
    let verifying_key = user_record.signature_bundle.verifying_key.clone();
    let is_valid = verifying_key.verify_signature(&data, &signature);

    match is_valid {
        Ok(_) => {
            debug!("is_valid: {:?}", is_valid);
        }
        Err(e) => {
            debug!("is_valid not valid: {:?}", e);
        }
    }
    let user_service = UserService::new(state.prover, body.signer.clone());

    match user_service.create_user_account(user_record).await {
        Ok(_) => {
            // Get the current timestamp safely
            let created_at = get_current_time();
            let signer = body.signer.clone();
            let account = AccountEntity {
                id: signer,
                public_key: body.public_key,
                created_at,
            };

            // Handle database insert result properly
            match state.account_repo.insert_account(&account) {
                Ok(_) => println!("Account inserted successfully"),
                Err(e) => eprintln!("Failed to insert account: {}", e),
            }

            let access_token = match create_access_token(body.signer.clone()) {
                Ok(token) => token,
                Err(e) => return e.into_response(),
            };

            let refresh_token = match create_refresh_token(body.signer) {
                Ok(token) => token,
                Err(e) => return e.into_response(),
            };

            (
                StatusCode::OK,
                Json(AuthWalletResponseDto {
                    success: true,
                    message: Some("Successfully logged in".to_string()),
                    access_token,
                    refresh_token,
                })
            ).into_response()
        },
        Err(e) => e.into_response(),
    }
}

pub async fn refresh_tokens(headers: HeaderMap) -> Response {
    let refresh_token = match headers.get("Authorization") {
        Some(auth_header) => {
            let auth_str = auth_header.to_str().unwrap_or("");
            if auth_str.starts_with("Bearer ") {
                auth_str[7..].to_string()
            } else {
                return (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({
                        "success": false,
                        "message": "Invalid authorization header format"
                    }))
                ).into_response();
            }
        },
        None => return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "success": false,
                "message": "No refresh token provided"
            }))
        ).into_response(),
    };

    // Verify refresh token and get claims
    let claims = match decode_token(refresh_token) {
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

    (
        StatusCode::OK,
        Json(json!({
            "success": true,
            "message": "Tokens refreshed successfully",
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token
        }))
    ).into_response()
}