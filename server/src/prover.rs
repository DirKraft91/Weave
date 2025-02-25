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

pub async fn register_service(prover: Arc<Prover>) -> Result<()> {
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
