mod operations;
mod router;
mod proof;
mod services;

use anyhow::{anyhow, Context, Result};
use keystore_rs::{KeyChain, KeyStore};
use log::{debug, info};
use prism_da::{memory::InMemoryDataAvailabilityLayer, DataAvailabilityLayer};
use prism_keys::SigningKey;
use prism_storage::inmemory::InMemoryDatabase;
use std::sync::Arc;
use tokio::spawn;
use prism_prover::{webserver::WebServerConfig, Config, Prover};

use crate::router::create_router;

pub static SERVICE_ID: &str = "weave_service";


async fn start_api_server() {
    let app = create_router();
    let listen_addr = "0.0.0.0:8080".to_string();
    info!("webserver listening on {}", listen_addr);
    println!("webserver listening on {}", listen_addr);
    if let Err(e) = axum::Server::bind(&listen_addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .context("Failed to start server") {
            log::error!("Server error: {}", e);
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    std::env::set_var(
            "RUST_LOG",
            "DEBUG,ctclient::internal=off,reqwest=off,hyper=off,tracing=off,sp1_stark=info,jmt=off,p3_dft=off,p3_fri=off,sp1_core_executor=info,sp1_recursion_program=info,p3_merkle_tree=off,sp1_recursion_compiler=off,sp1_core_machine=off",
        );
    pretty_env_logger::init();

    let api_server_handle = spawn(start_api_server());

    let db = InMemoryDatabase::new();
    let (da_layer, _, _) = InMemoryDataAvailabilityLayer::new(5);

    let keystore_sk = KeyChain.get_or_create_signing_key(SERVICE_ID)?;

    let sk = SigningKey::Ed25519(Box::new(keystore_sk.clone()));

    println!("starting prover");
    let cfg = Config {
        prover: true,
        batcher: true,
        webserver: WebServerConfig {
            enabled: true,
            host: "127.0.0.1".to_string(),
            port: 50524,
        },
        signing_key: sk.clone(),
        verifying_key: sk.verifying_key(),
        start_height: 1,
    };

    let prover = Arc::new(
        Prover::new(
            Arc::new(Box::new(db)),
            Arc::new(da_layer) as Arc<dyn DataAvailabilityLayer>,
            &cfg,
        )
        .unwrap(),
    );

    let runner = prover.clone();
    let runner_handle = spawn(async move {
        debug!("starting prover");
        if let Err(e) = runner.run().await {
            log::error!("Error occurred while running prover: {:?}", e);
        }
    });

    tokio::select! {
        _ = runner_handle => {
            println!("Prover runner task completed");
        }
        _ = api_server_handle => {
            println!("API server task completed");
        }
    }

    Ok(())
}