use anyhow::Context;
use log::info;
use anyhow::Result;
use crate::api::routes;

use super::handlers::auth::AppState;


pub async fn start_server(state: AppState) -> Result<()> {
    let app = routes::create_router(state);
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