use anyhow::Result;
use keystore_rs::{KeyChain, KeyStore};
use prism_da::{memory::InMemoryDataAvailabilityLayer, DataAvailabilityLayer};
use prism_keys::SigningKey;
use prism_storage::inmemory::InMemoryDatabase;
use std::sync::Arc;
use prism_prover::{webserver::WebServerConfig, Config, Prover};
use log::debug;

use crate::operations::register_service;
use crate::SERVICE_ID;


pub struct NodeService {
    pub prover: Arc<Prover>,
}

impl NodeService {
    pub fn new() -> Self {
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
    
        Self { prover }
    }

    pub async fn run_prover(&self) -> Result<()> {
        let runner = self.prover.clone();
        debug!("starting prover");
        register_service(self.prover.clone()).await?;
        runner.run().await
    }
}
