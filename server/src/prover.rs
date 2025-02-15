use std::sync::Arc;

use keystore_rs::{KeyChain, KeyStore};
use prism_da::{memory::InMemoryDataAvailabilityLayer, DataAvailabilityLayer};
use prism_storage::inmemory::InMemoryDatabase;
use prism_prover::{webserver::WebServerConfig, Config, Prover};
use log::debug;

use prism_common::{
    account::Account,
    operation::{Operation, ServiceChallenge},
};
use prism_keys::{SigningKey, VerifyingKey};
use prism_tree::AccountResponse::Found;

use anyhow::{anyhow, Result};

use crate::SERVICE_ID;

pub async fn register_service(prover: Arc<Prover>) -> Result<()> {
    // First, we make sure the service is not already registered.
    if let Found(_, _) = prover.get_account(&SERVICE_ID.to_string()).await? {
        debug!("Service already registered.");
        return Ok(());
    };

    // Next we use our keystore crate to get/create a new private key for the service.
    // By default, this is stored in the operating system's keychain.
    let keystore_sk = KeyChain
        .get_signing_key(SERVICE_ID)
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;

    let sk = SigningKey::Ed25519(Box::new(keystore_sk));
    let vk: VerifyingKey = sk.verifying_key();

    // Now we create the operation to register the service. Under the hood, this
    // creates a prism account that links the service's public key to the
    // service id -- only allowing this keypair to authorize account creations
    // from the service.
    let register_op = Operation::RegisterService {
        id: SERVICE_ID.to_string(),
        creation_gate: ServiceChallenge::Signed(vk.clone()),
        key: vk,
    };

    // Because the account is new (the service does not yet exist), we create an
    // empty account to store the transaction.
    let service_account = Account::default();

    // Here we prepare the operation into a transaction by signing it with the service's private key.
    let register_tx =
        service_account.prepare_transaction(SERVICE_ID.to_string(), register_op, &sk)?;

    debug!("Submitting transaction to register test service");
    prover
        .clone()
        .validate_and_queue_update(register_tx)
        .await?;

    Ok(())
}

pub fn create_prover_server() -> Arc<Prover> {
    let db = InMemoryDatabase::new();
    let (da_layer, _, _) = InMemoryDataAvailabilityLayer::new(5);
    let keystore_sk = KeyChain.get_or_create_signing_key(SERVICE_ID).unwrap();
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

    let prover = Arc::new(
        Prover::new(
            Arc::new(Box::new(db)),
            Arc::new(da_layer) as Arc<dyn DataAvailabilityLayer>,
            &cfg,
        )
        .unwrap(),
    );
    
    return prover;
}

pub async fn start_prover_server(prover: Arc<Prover>) -> Result<()> {
    register_service(prover.clone()).await?;
    prover.clone().run().await
}