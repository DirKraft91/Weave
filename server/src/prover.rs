use std::sync::Arc;

use keystore_rs::{KeyChain, KeyStore};
use prism_da::{memory::InMemoryDataAvailabilityLayer, DataAvailabilityLayer};
use prism_storage::inmemory::InMemoryDatabase;
use prism_prover::{webserver::WebServerConfig, Config, Prover};
use log::debug;
use prism_client::{
    SigningKey, 
    VerifyingKey, 
    PrismApi,
    PendingTransaction,
};

use anyhow::{anyhow, Result};

use crate::SERVICE_ID;

async fn register_service(prover: Arc<Prover>) -> Result<()> {
    // First, we make sure the service is not already registered.
    if prover.get_account(SERVICE_ID).await?.account.is_some() {
        debug!("Service already registered.");
        return Ok(());
    }

    // Next we use our keystore crate to get/create a new private key for the service.
    // By default, this is stored in the operating system's keychain.
    let keystore_sk = KeyChain
        .get_or_create_signing_key(SERVICE_ID)
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;

    let sk = SigningKey::Ed25519(Box::new(keystore_sk));
    let vk: VerifyingKey = sk.verifying_key();

    // Now we create the operation to register the service. Under the hood, this
    // creates a prism account that links the service's public key to the
    // service id -- only allowing this keypair to authorize account creations
    // from the service.
    debug!("Submitting transaction to register test service");
    prover
        .register_service(SERVICE_ID.to_string(), vk, &sk)
        .await?
        .wait()
        .await?;

    Ok(())
}

pub fn create_prover_server() -> Arc<Prover> {
    let db = InMemoryDatabase::new();
    let (da_layer, _, _) = InMemoryDataAvailabilityLayer::new(5);
    let keystore_sk = match KeyChain.get_or_create_signing_key(SERVICE_ID) {
        Ok(sk) => sk,
        Err(e) => panic!("Error getting key from keychain: {}", e),
    };
    let sk = SigningKey::Ed25519(Box::new(keystore_sk.clone()));
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

    return Arc::new(
        Prover::new(
            Arc::new(Box::new(db)),
            Arc::new(da_layer) as Arc<dyn DataAvailabilityLayer>,
            &cfg,
        )
        .unwrap(),
    );
}

pub async fn start_prover_server(prover: Arc<Prover>) -> Result<()> {
    register_service(prover.clone()).await?;
    prover.clone().run().await
}