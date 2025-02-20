use axum::{
    http::{Request, StatusCode, header},
    middleware::Next,
    response::Response,
};
use crate::domain::models::auth::JwtUserPayload;
use crate::utils::jwt;

pub async fn auth_middleware<B>(
    mut request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|auth_str| {
            if auth_str.starts_with("Bearer ") {
                Some(auth_str[7..].to_string())
            } else {
                None
            }
        });

    match auth_header {
        Some(token) => {
            match jwt::decode_token(token) {
                Ok(claims) => {
                    request.extensions_mut().insert(JwtUserPayload::new(claims.sub));
                    Ok(next.run(request).await)
                }
                Err(_) => Err(StatusCode::UNAUTHORIZED),
            }
        }
        None => Err(StatusCode::UNAUTHORIZED),
    }
}
