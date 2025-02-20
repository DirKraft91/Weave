use prism_prover::Prover;
use std::sync::Arc;

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
use crate::api::handlers::proof::add_proof;
use crate::api::handlers::user::get_user;
use crate::api::handlers::auth::{auth_wallet, refresh_tokens, logout};

pub fn create_router(prover: Arc<Prover>) -> Router {
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
        .route("/auth", post(auth_wallet))
        .route("/auth/refresh", post(refresh_tokens))
        .route("/auth/logout", post(logout));

    let protected_routes = Router::new()
        .route("/proof", post(add_proof))
        .route("/get-account", get(get_user))
        .layer(middleware::from_fn(auth_middleware));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(cors)
        .with_state(prover)
}
