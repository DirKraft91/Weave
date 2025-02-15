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
        .and_then(|header| header.to_str().ok());

    match auth_header {
        Some(auth_str) => {
            match jwt::extract_token(&auth_str) {
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
