mod middleware;
mod api;
mod entities;
mod domain;
mod utils;
mod schema;
mod services;
use api::handlers::auth::AppState;
use diesel::MysqlConnection;
use diesel::Connection;
use keystore_rs::KeyStore;
use prism_keys::CryptoAlgorithm;
use tokio::spawn;
use dotenv::dotenv;
use std::env;
use std::sync::Arc;
use std::fs;
use std::path::Path;
use shellexpand;
use keystore_rs::FileStore;
use prism_da::{memory::InMemoryDataAvailabilityLayer, DataAvailabilityLayer};
use prism_storage::inmemory::InMemoryDatabase;
use prism_prover::{webserver::WebServerConfig, Config, Prover};
use log::debug;
use prism_client::SigningKey;
use anyhow::{anyhow, Result};
use prism_client::{
    PrismApi,
    PendingTransaction,
};

pub static SERVICE_ID: &str = "weave_service";
pub static KEYSTORE_PATH: &str = "~/.prism/keystore.json";

pub async fn register_service(prover: Arc<Prover>) -> Result<()> {
    if prover.get_account(SERVICE_ID).await?.account.is_some() {
        debug!("Service already registered.");
        return Ok(());
    }

    let sk = FileStore::new(KEYSTORE_PATH).unwrap()
        .get_or_create_signing_key(SERVICE_ID)
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;
    let sk = SigningKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, &sk.to_bytes())?;

    let vk = sk.verifying_key();

    debug!("Submitting transaction to register test service");
    prover
        .register_service(SERVICE_ID.to_string(), vk, &sk)
        .await?
        .wait()
        .await?;

    Ok(())
}

fn establish_connection() -> MysqlConnection {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    MysqlConnection::establish(&database_url).expect("Error connecting to database")
}

fn init_keystore() -> Result<()> {
    let keystore_path = shellexpand::tilde(KEYSTORE_PATH);
    let path = Path::new(keystore_path.as_ref());
    
    if !path.exists() {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        
        let symmetric_key = env::var("SYMMETRIC_KEY")
            .expect("SYMMETRIC_KEY must be set");
        let keystore_content = format!(r#"{{
            "symmetric_key": "{}",
            "keys": {{}}
        }}"#, symmetric_key);
        fs::write(path, keystore_content)?;
    }

    Ok(())
}



#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    init_keystore()?;
    let conn = establish_connection();
    let repo = entities::user_repo::UserRepo::new(conn);

    std::env::set_var(
        "RUST_LOG",
        "DEBUG,ctclient::internal=off,reqwest=off,hyper=off,tracing=off,sp1_stark=info,jmt=off,p3_dft=off,p3_fri=off,sp1_core_executor=info,sp1_recursion_program=info,p3_merkle_tree=off,sp1_recursion_compiler=off,sp1_core_machine=off",
    );
    pretty_env_logger::init();

    let db = InMemoryDatabase::new();
    let (da_layer, _, _) = InMemoryDataAvailabilityLayer::new(5);


    let sk = FileStore::new(KEYSTORE_PATH).unwrap()
        .get_or_create_signing_key(SERVICE_ID)
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;
    let sk = SigningKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, &sk.to_bytes())?;

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
    let prover_runner_handle = spawn(async move {
        debug!("starting prover");
        if let Err(e) = runner.run().await {
            log::error!("Error occurred while running prover: {:?}", e);
        }
    });
    let state = AppState{
        prover: prover.clone(),
        user_repo: repo,
    };
    let api_server_runner_handle = spawn(async move {
        debug!("registering service");
        register_service(prover.clone()).await.unwrap();
        debug!("starting api server");
        if let Err(e) = api::server::start_server(state).await {
            log::error!("Error occurred while running API server: {:?}", e);
        }
    });
    

    tokio::select! {
        _ = prover_runner_handle => {
            println!("Prover runner task completed");
        }
        _ = api_server_runner_handle => {
            println!("API server task completed");
        }
    }

    Ok(())
}
