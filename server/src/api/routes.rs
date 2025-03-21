use axum::{
    routing::post,
    routing::get,
    Router,
    middleware,
};
use tower_http::cors::{CorsLayer, Any};
use http::{
    header::HeaderName,
    method::Method,
    HeaderValue,
};
use crate::middleware::auth::auth_middleware;
use crate::api::handlers::proof::{prepare_to_apply_proof, apply_proof, get_applied_proof_stats};
use crate::api::handlers::user::{get_user, get_me};
use crate::api::handlers::auth::{auth_wallet, refresh_tokens, prepare_auth_data};
use crate::api::handlers::health::health_check;

use super::handlers::auth::AppState;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173". parse::<HeaderValue>().unwrap(),
        ])
        .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(vec![
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ])
        .allow_credentials(true);

    let public_routes = Router::new()
        .route("/api/auth/prepare", post(prepare_auth_data))
        .route("/api/auth", post(auth_wallet))
        .route("/api/auth/refresh", post(refresh_tokens))
        .route("/api/proof-stats", get(get_applied_proof_stats))
        .route("/health", get(health_check));

    let protected_routes = Router::new()
        .route("/api/proof/prepare", post(prepare_to_apply_proof))
        .route("/api/proof", post(apply_proof))
        .route("/api/me", get(get_me))
        .route("/api/user/:user_id", get(get_user))
        .layer(middleware::from_fn(auth_middleware));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(cors)
        .with_state(state)
}
