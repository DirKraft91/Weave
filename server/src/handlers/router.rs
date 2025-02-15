use anyhow::Context;
use log::info;
use anyhow::Result;
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
    method::Method
};
use crate::proof::apply_proof;
use crate::proof::get_account;
use crate::handlers::auth_handler::{auth, refresh_token};
use crate::middleware::auth::auth_middleware;

pub struct ApiService {
    prover: Arc<Prover>,
}

impl ApiService {
    pub fn new(prover: &Arc<Prover>) -> Self {
        Self { prover: prover.clone() }
    }

    pub async fn start_server(&self) -> Result<()> {
        let app = self.create_router();
        let listen_addr = "0.0.0.0:8080".to_string();
        info!("webserver listening on {}", listen_addr);
        if let Err(e) = axum::Server::bind(&listen_addr.parse().unwrap())
            .serve(app.into_make_service())
            .await
            .context("Failed to start server") {
                log::error!("Server error: {}", e);
        }
        Ok(())
    }

    fn create_router(&self) -> Router {
        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
            .allow_headers(vec![
                HeaderName::from_static("content-type"),
                HeaderName::from_static("authorization"),
            ]);

        let public_routes = Router::new()
            .route("/auth", post(auth))
            .route("/auth/refresh", post(refresh_token));

        let protected_routes = Router::new()
            .route("/proof", post(apply_proof))
            .route("/get-account", get(get_account))
            .layer(middleware::from_fn(auth_middleware));

        Router::new()
            .merge(public_routes)
            .merge(protected_routes)
            .layer(cors)
            .with_state(self.prover.clone())
    }
}
