use axum::{
    routing::post,
    Router,
};
use tower_http::cors::{CorsLayer, Any};
use http::{
    header::HeaderName,
    method::Method
};
use std::sync::Arc;
use crate::node::Node;
use crate::webserver::submit_tx;
use crate::proof::apply_proof;
use crate::services::auth::auth;

pub fn create_router(node: Arc<Node>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(vec![
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ]);

    Router::new()
        .route("/submit_tx", post(submit_tx))
        .route("/proof", post(apply_proof))
        .route("/auth", post(auth))
        .layer(cors)
        .with_state(node)
}
