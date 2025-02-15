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
    let access_token = request
        .headers()
        .get(header::COOKIE)
        .and_then(|cookie_header| {
            cookie_header
                .to_str()
                .ok()
                .and_then(|cookie_str| {
                    cookie_str
                        .split(';')
                        .find(|cookie| cookie.trim().starts_with("access_token="))
                        .map(|cookie| cookie.trim().strip_prefix("access_token=").unwrap())
                })
        });

    match access_token {
        Some(token) => {
            match jwt::decode_token(token.to_string()) {
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
