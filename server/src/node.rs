use anyhow::{Context, Result};
use async_lock::Mutex;
use celestia_rpc::{BlobClient, HeaderClient};
use celestia_types::{nmt::Namespace, Blob, TxConfig};
use std::fmt::{ Error };
use std::str::FromStr;
use std::{sync::Arc};
use std::time::Duration as StdDuration;
use tokio::sync::Notify;
use reclaim_rust_sdk::{ Proof as ReclaimProof };
use axum::{
    routing::{get, post},
    response::{ IntoResponse, Json as AxumJson },
    http as AxumHttp,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, EncodingKey, Header};
use chrono::{Utc, Duration as ChronoDuration};

use crate::tx::Batch;
use crate::webserver::submit_tx;
use crate::{state::State, tx::Transaction};
use tower_http::cors::{CorsLayer, Any};
use http::{
    header::HeaderName,
    method::Method
};
use crate::proof::{ProofService, IdentityProvider, ProofServiceError, ReclaimProofService};

const DEFAULT_BATCH_INTERVAL: StdDuration = StdDuration::from_secs(3);

#[derive(Clone)]
pub struct Config {
    /// The namespace used by this rollup.
    pub namespace: Namespace,

    /// The height from which to start syncing.
    // TODO: Backwards sync, accepting trusted state (celestia blocks get
    // pruned)
    pub start_height: u64,

    /// The address to listen on for the node's webserver.
    pub listen_addr: String,

    /// The URL of the Celestia node to connect to.
    // TODO: Move fully to Lumina, only use a url for posting transactions
    // until p2p tx transmission is implemented
    pub celestia_url: String,
    /// The auth token to use when connecting to Celestia.
    pub auth_token: Option<String>,

    /// The interval at which to post batches of transactions.
    pub batch_interval: StdDuration,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            namespace: Namespace::new_v0(&[42, 42, 42, 42]).unwrap(),
            start_height: 1,
            listen_addr: "0.0.0.0:8080".to_string(),
            celestia_url: "ws://0.0.0.0:26658".to_string(),
            auth_token: None,
            batch_interval: DEFAULT_BATCH_INTERVAL,
        }
    }
}

pub struct Node {
    da_client: celestia_rpc::Client,
    cfg: Config,

    /// The state of the rollup that is mutated by incoming transactions
    state: Arc<Mutex<State>>,

    /// Transactions that have been queued for batch posting to Celestia
    pending_transactions: Arc<Mutex<Vec<Transaction>>>,

    /// Used to notify the syncer that genesis sync has completed, and queued
    /// stored blocks from incoming sync can be processed
    genesis_sync_completed: Notify,
}

impl Node {
    pub async fn new(cfg: Config) -> Result<Self> {
        let auth_token: Option<&str> = cfg.auth_token.as_deref();

        let da_client = celestia_rpc::Client::new(&cfg.celestia_url, auth_token)
            .await
            .context("Couldn't start RPC connection to celestia-node instance")?;

        Ok(Node {
            cfg,
            da_client,
            genesis_sync_completed: Notify::new(),
            pending_transactions: Arc::new(Mutex::new(Vec::new())),
            state: Arc::new(Mutex::new(State::new())),
        })
    }

    pub async fn queue_transaction(&self, tx: Transaction) -> Result<()> {
        self.state.lock().await.validate_tx(tx.clone())?;
        self.pending_transactions.lock().await.push(tx);
        Ok(())
    }

    async fn post_pending_batch(&self) -> Result<Batch> {
        let mut pending_txs = self.pending_transactions.lock().await;
        if pending_txs.is_empty() {
            return Ok(Batch::new(Vec::new()));
        }

        let batch = Batch::new(pending_txs.drain(..).collect());
        let encoded_batch = bincode::serialize(&batch)?;
        let blob = Blob::new(self.cfg.namespace, encoded_batch)?;

        BlobClient::blob_submit(&self.da_client, &[blob], TxConfig::default()).await?;

        Ok(batch)
    }

    async fn process_l1_block(&self, blobs: Vec<Blob>) {
        let txs: Vec<Transaction> = blobs
            .into_iter()
            .flat_map(|blob| {
                Batch::try_from(&blob)
                    .map(|b| b.get_transactions())
                    .unwrap_or_default()
            })
            .collect();

        let mut state = self.state.lock().await;
        for tx in txs {
            if let Err(e) = state.process_tx(tx) {
                error!("processing tx: {}", e);
            }
        }
    }

    async fn sync_historical(&self) -> Result<()> {
        let network_head = HeaderClient::header_network_head(&self.da_client).await?;
        let network_height = network_head.height();
        info!(
            "syncing historical blocks from {}-{}",
            self.cfg.start_height,
            network_height.value()
        );

        for height in self.cfg.start_height..network_height.value() {
            let blobs =
                BlobClient::blob_get_all(&self.da_client, height, &[self.cfg.namespace]).await?;
            if let Some(blobs) = blobs {
                self.process_l1_block(blobs).await;
            }
        }

        info!("historical sync completed");
        self.genesis_sync_completed.notify_one();

        Ok(())
    }

    async fn sync_incoming_blocks(&self) -> Result<()> {
        let mut blobsub = BlobClient::blob_subscribe(&self.da_client, self.cfg.namespace)
            .await
            .context("Failed to subscribe to app namespace")?;

        self.genesis_sync_completed.notified().await;

        while let Some(result) = blobsub.next().await {
            match result {
                Ok(blob_response) => {
                    info!(
                        "processing incoming celestia height: {}",
                        blob_response.height
                    );
                    if let Some(blobs) = blob_response.blobs {
                        self.process_l1_block(blobs).await;
                    }
                }
                Err(e) => error!("retrieving blobs from DA layer: {}", e),
            }
        }
        Ok(())
    }

    async fn sync(self: Arc<Self>) -> Result<()> {
        let genesis_sync = {
            let node = self.clone();
            tokio::spawn(async move { node.sync_historical().await })
        };

        let incoming_sync = {
            let node = self.clone();
            tokio::spawn(async move { node.sync_incoming_blocks().await })
        };

        let res = tokio::join!(genesis_sync, incoming_sync);

        match res {
            (Ok(Ok(_)), Ok(Ok(_))) => Ok(()),
            (Err(e), _) | (_, Err(e)) => Err(anyhow::anyhow!("Task join error: {}", e)),
            (Ok(Err(e)), _) | (_, Ok(Err(e))) => Err(e),
        }
    }

    async fn start_batch_posting(&self) -> Result<()> {
        loop {
            tokio::time::sleep(self.cfg.batch_interval).await;
            match self.post_pending_batch().await {
                Ok(batch) => {
                    let tx_count = batch.get_transactions().len();
                    if tx_count > 0 {
                        info!("batch posted with {} transactions", tx_count);
                    } else {
                        debug!("no transactions to post, skipping batch");
                    }
                }
                Err(e) => error!("posting batch: {}", e),
            }
        }
    }

    pub async fn start_server(self: Arc<Self>) -> Result<()> {
        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
            .allow_headers(vec![
                HeaderName::from_static("content-type"),
                HeaderName::from_static("authorization"),
            ]);

        let app = Router::new()
            .route("/submit_tx", post(submit_tx))
            .route("/proof", post(apply_proof))
            .route("/auth", post(sign_in_wallet))
            .layer(cors)
            .with_state(self.clone());

        let listen_addr = self.cfg.listen_addr.clone();
        info!("webserver listening on {}", listen_addr);
        axum::Server::bind(&listen_addr.parse().unwrap())
            .serve(app.into_make_service())
            .await
            .context("Failed to start server")

    }

    pub async fn start(self: Arc<Self>) -> Result<()> {
        let sync_handle = self.clone().sync();

        let webserver = {
            let node = self.clone();
            tokio::spawn(async move { node.start_server().await })
        };

        let batch_posting = {
            let node = self.clone();
            tokio::spawn(async move { node.start_batch_posting().await })
        };

        tokio::select! {
            _ = sync_handle => {
                error!("sync task exited");
            }
            _ = webserver => {
                error!("webserver task exited");
            }
            _ = batch_posting => {
                error!("batch posting task exited");
            }
        }
        Ok(())
    }
}


use ecdsa::signature::DigestVerifier;
use k256::sha2::{Digest, Sha256};

#[derive(Serialize, Deserialize)]
struct SignInWalletPayload {
    public_key: String,
    signature: String,
    signer: String,
    message: String,
}

#[derive(Debug, Serialize)]
struct Claims {
    sub: String,  // subject (address)
    exp: i64,     // expiration time
    iat: i64,     // issued at
}

#[derive(Serialize)]
struct SignInWalletResponse {
    auth: bool,
}

fn generate_amino_transaction_string(signer: &str, data: &str) -> String {
    format!("{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}", data, signer)
}

fn verify_arbitrary(
    account_addr: &str,
    public_key: &str,
    signature: &str,
    data: &[u8],
) -> Result<(), Error> {
    let rpc_signature_to_compare = hex::encode(base64::decode(&signature).unwrap());
    let signature: k256::ecdsa::Signature =
        ecdsa::Signature::from_str(&rpc_signature_to_compare).unwrap();
    let digest = Sha256::new_with_prefix(generate_amino_transaction_string(
        account_addr,
        &base64::encode(data),
    ));
    let pk = tendermint::PublicKey::from_raw_secp256k1(base64::decode(public_key).unwrap().as_slice())
        .unwrap();
    let vk = pk.secp256k1().unwrap();

    vk.verify_digest(digest, &signature).map_err(|_| Error)
}

async fn sign_in_wallet(Json(body): Json<SignInWalletPayload>) -> impl IntoResponse {
    match verify_arbitrary(&body.signer, &body.public_key, &body.signature, &body.message.as_bytes()) {
        Ok(_) => {
            let expiration = Utc::now()
                .checked_add_signed(ChronoDuration::hours(24))
                .expect("valid timestamp")
                .timestamp();

            let claims = Claims {
                sub: body.signer.clone(),
                exp: expiration,
                iat: Utc::now().timestamp(),
            };

            let token = encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret("your-secret-key".as_bytes()) // move it to env variable
            ).unwrap();

            let auth_header = format!("Bearer {}", token);

            let response = SignInWalletResponse {
                auth: true,
            };

            (
                AxumHttp::StatusCode::OK,
                [(AxumHttp::header::AUTHORIZATION, auth_header)],
                AxumJson(response)
            ).into_response()
        },
        Err(e) => (
            AxumHttp::StatusCode::UNAUTHORIZED,
            [(AxumHttp::header::WWW_AUTHENTICATE, "Bearer")],
            format!("{}", e)
        ).into_response(),
    }
}


#[derive(Deserialize, Serialize)]
struct ProofApplyPayload {
    proof: ReclaimProof,
    provider: String,
}

#[derive(Serialize)]
struct ProofApplyResponse {
    success: bool,
}

async fn apply_proof(Json(payload): Json<ProofApplyPayload>) -> impl IntoResponse {
    match ProofService::apply_proof(&ReclaimProofService {
        data: payload.proof,
        provider: IdentityProvider::from_str(&payload.provider).unwrap(),
    }).await {
        Ok(()) => (AxumHttp::StatusCode::OK, AxumJson(ProofApplyResponse { success: true })).into_response(),
        Err(e) => {
            match e {
                ProofServiceError::ReclaimProofNotVerifiedError(e) => (AxumHttp::StatusCode::BAD_REQUEST, format!("{}", e)).into_response(),
                _ => (AxumHttp::StatusCode::INTERNAL_SERVER_ERROR, format!("{:?}", e)).into_response(),
            }
        },
    }
}

