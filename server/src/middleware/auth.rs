use axum::{
    http::{Request, StatusCode, header},
    middleware::Next,
    response::Response,
};
use crate::services::{
    jwt::JwtService,
    models::{AuthUser, TokenType},
    token_utils::TokenUtils,
};

pub async fn auth_middleware<B>(
    mut request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    match auth_header {
        Some(auth_str) => {
            let token = auth_str.strip_prefix("Bearer ")
                .ok_or(StatusCode::UNAUTHORIZED)?;

            // Check if the token should be refreshed
            if TokenUtils::should_refresh_token(token) {
                return Err(StatusCode::UNAUTHORIZED);
            }

            // Check if the token is valid
            match JwtService::verify_token(token, TokenType::Access) {
                Ok(claims) => {
                    request.extensions_mut().insert(AuthUser {
                        user_id: claims.sub,
                    });
                    Ok(next.run(request).await)
                }
                Err(_) => Err(StatusCode::UNAUTHORIZED),
            }
        }
        None => Err(StatusCode::UNAUTHORIZED),
    }
}
