use axum::{
    http::{Request, StatusCode, header},
    middleware::Next,
    response::Response,
};
use crate::services::auth::JwtService;

pub async fn auth_middleware<B>(
    request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let token = extract_token_from_header(&request)?;

    match JwtService::verify_token(token) {
        Ok(_claims) => Ok(next.run(request).await),
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}

fn extract_token_from_header<B>(request: &Request<B>) -> Result<&str, StatusCode> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if !auth_header.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(&auth_header["Bearer ".len()..])
}
