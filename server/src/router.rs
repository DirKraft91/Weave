use axum::{
    routing::post,
    Router,
    middleware,
};
use tower_http::cors::{CorsLayer, Any};
use http::{
    header::HeaderName,
    method::Method
};
use crate::proof::apply_proof;
use crate::services::auth::{auth, auth_middleware};

pub fn create_router() -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(vec![
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ]);

    // Public routes that don't require authentication
    let public_routes = Router::new()
        .route("/auth", post(auth));

    // Protected routes that require authentication
    let protected_routes = Router::new()
        .route("/proof", post(apply_proof))
        .layer(middleware::from_fn(auth_middleware));

    // Combine the routes
    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(cors)
}
