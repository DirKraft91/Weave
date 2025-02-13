use log::debug;
use reclaim_rust_sdk::{ Proof as ReclaimProof, ProofNotVerifiedError as ReclaimProofNotVerifiedError };
use std::str::FromStr;
use std::string::ToString;
use serde_json::Value;
use chrono::Utc;
use thiserror::Error;
use axum::{
    response::{ IntoResponse, Json as AxumJson },
    http as AxumHttp,
    Json,
    extract::{Extension, State},
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::{middleware::auth::AuthUser, SERVICE_ID};
use prism_prover::Prover;
use prism_keys::SigningKey;
use prism_common::{
    account::Account, digest::Digest, operation::{Operation, SignatureBundle}
};
use keystore_rs::{KeyChain, KeyStore};
use prism_tree::AccountResponse::Found;
use prism_tree::AccountResponse::NotFound;

pub enum IdentityProvider {
    X,
    Google,
    Github,
    Linkedin
}

impl FromStr for IdentityProvider {
    type Err = String;  // Custom error type

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "x" => Ok(IdentityProvider::X),
            "google" => Ok(IdentityProvider::Google),
            "github" => Ok(IdentityProvider::Github),
            "linkedin" => Ok(IdentityProvider::Linkedin),
            _ => Err(format!("Invalid provider: {}", s)),
        }
    }
}

impl ToString for IdentityProvider {
    fn to_string(&self) -> String {
        match self {
            IdentityProvider::X => "x".to_string(),
            IdentityProvider::Google => "google".to_string(),
            IdentityProvider::Github => "github".to_string(),
            IdentityProvider::Linkedin => "linkedin".to_string(),
        }
    }
}

#[derive(Debug, Error)]
pub enum ProofServiceError {
    #[error("Reclaim proof could not be verified: {0}")]
    ReclaimProofNotVerifiedError(ReclaimProofNotVerifiedError),

    #[error("Failed to deserialize context data: {0}")]
    ContextDeserializationError(serde_json::Error),

    #[error("email not found in context")]
    EmailNotFound,

    #[error("screen_name not found in context")]
    ScreennameNotFound,

    #[error("username not found in context")]
    UsernameNotFound,

    #[error("Key store error: {0}")]
    KeyStoreError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Transaction error: {0}")]
    TransactionError(String),

    #[error("Account not found")]
    AccountNotFound,
}

impl From<anyhow::Error> for ProofServiceError {
    fn from(error: anyhow::Error) -> Self {
        ProofServiceError::TransactionError(error.to_string())
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct GoogleProviderIdentityRecord {
    proof: ReclaimProof,
    email: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct XProviderIdentityRecord {
    proof: ReclaimProof,
    nickname: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct GithubProviderIdentityRecord {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct LinkedinProviderIdentityRecord {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
enum IdentityRecord {
    X(XProviderIdentityRecord),
    Google(GoogleProviderIdentityRecord),
    Github(GithubProviderIdentityRecord),
    Linkedin(LinkedinProviderIdentityRecord),
}

pub trait ProofService {
    async fn apply_proof(&self) -> Result<Account, ProofServiceError>;
}

struct ReclaimProofService {
    data: ReclaimProof,
    provider: IdentityProvider,
    prover: Arc<Prover>,
    auth_user: AuthUser,
}

impl ReclaimProofService {
    fn prepare_payload_to_apply(&self) -> Result<IdentityRecord, ProofServiceError> {
        match self.provider {
            IdentityProvider::X => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let nickname = context["extractedParameters"]["screen_name"]
                    .as_str()
                    .ok_or(ProofServiceError::ScreennameNotFound)?
                    .to_string();

                Ok(IdentityRecord::X(XProviderIdentityRecord {
                    proof: self.data.clone(),
                    nickname,
                    created_at: Utc::now().timestamp(),
                    provider: self.provider.to_string()
                }))
            },
            IdentityProvider::Google => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let email = context["extractedParameters"]["email"]
                    .as_str()
                    .ok_or(ProofServiceError::EmailNotFound)?
                    .trim_matches('"')
                    .to_lowercase();

                Ok(IdentityRecord::Google(GoogleProviderIdentityRecord {
                    proof: self.data.clone(),
                    email,
                    created_at: Utc::now().timestamp(),
                    provider: self.provider.to_string(),
                }))
            },
            IdentityProvider::Github => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let username = context["extractedParameters"]["username"]
                    .as_str()
                    .ok_or(ProofServiceError::UsernameNotFound)?
                    .to_string();

                Ok(IdentityRecord::Github(GithubProviderIdentityRecord {
                    proof: self.data.clone(),
                    username,
                    created_at: Utc::now().timestamp(),
                    provider: self.provider.to_string(),
                }))
            },
            IdentityProvider::Linkedin => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let username = context["extractedParameters"]["Username"]
                    .as_str()
                    .ok_or(ProofServiceError::UsernameNotFound)?
                    .to_string();

                Ok(IdentityRecord::Linkedin(LinkedinProviderIdentityRecord {
                    proof: self.data.clone(),
                    username,
                    created_at: Utc::now().timestamp(),
                    provider: self.provider.to_string(),
                }))
            }
        }
    }

    async fn validate(&self) -> Result<bool, ProofServiceError> {
        match reclaim_rust_sdk::verify_proof(&self.data).await {
            Ok(is_valid) => {
                if is_valid {
                    Ok(true)
                } else {
                    Err(ProofServiceError::ReclaimProofNotVerifiedError(ReclaimProofNotVerifiedError("Proof is not valid".to_string())))
                }
            },
            Err(e) => Err(ProofServiceError::ReclaimProofNotVerifiedError(e)),
        }
    }
}

impl ProofService for ReclaimProofService {
    async fn apply_proof(&self) -> Result<Account, ProofServiceError> {
        self.validate().await?;

        debug!("ReclaimProofService::apply_proof: {}", self.auth_user.user_id);
        if let Found(account, _) = self.prover.get_account(&self.auth_user.user_id).await
            .map_err(|_| ProofServiceError::AccountNotFound)? {
            
            let tx_payload: IdentityRecord = self.prepare_payload_to_apply()?;
            let json_string = serde_json::to_string(&tx_payload)
                .map_err(|e| ProofServiceError::SerializationError(e.to_string()))?;
            let data = json_string.as_bytes();
            
            let user_keystore = KeyChain
                .get_signing_key(&format!("{}/{}", self.auth_user.user_id, SERVICE_ID))
                .map_err(|e| ProofServiceError::KeyStoreError(e.to_string()))?;

            let user_sk = SigningKey::Ed25519(Box::new(user_keystore));
            let user_vk = user_sk.verifying_key();
            let hash = Digest::hash(data);
            let signature = user_sk.sign(&hash.to_bytes());

            let signature_bundle = SignatureBundle { 
                verifying_key: user_vk, 
                signature: signature
            };

            let add_data_op = Operation::AddData { 
                data: data.to_vec(), 
                data_signature: signature_bundle
            };

            let mut account = account.clone();
            let add_data_tx = account.prepare_transaction(self.auth_user.user_id.clone(), add_data_op, &user_sk)?;
            self.prover.clone().validate_and_queue_update(add_data_tx.clone()).await?;
            account.process_transaction(&add_data_tx)?;

            return Ok(*account);
        }
        Err(ProofServiceError::AccountNotFound)
    }
}

enum ProofServiceProvider {
    Reclaim(ReclaimProofService),
}

impl ProofService for ProofServiceProvider {
    async fn apply_proof(&self) -> Result<Account, ProofServiceError> {
        match self {
            ProofServiceProvider::Reclaim(state) => state.apply_proof().await,
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct ProofApplyPayload {
    proof: ReclaimProof,
    provider: String,
}

#[derive(Serialize)]
pub struct ProofApplyResponse {
    success: bool,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}
#[derive(Serialize)]
struct AccountResponce {
    id: String,
    proofs: Vec<IdentityRecord>,
}

pub async fn get_account(
    State(prover): State<Arc<Prover>>,
    Extension(auth_user): Extension<AuthUser>
) -> impl IntoResponse {
    let user_id = auth_user.user_id;

    match prover.get_account(&user_id).await {
        Ok(Found(account_box, proof)) => {
            // TODO do we need to check the proof or something?
            let account = *account_box;
            let account_id = account.id();
            let mut proofs: Vec<IdentityRecord> = Vec::new();
            
            for signed in account.signed_data() {
                let raw_data: &Vec<u8> = &signed.data;
                match serde_json::from_slice::<IdentityRecord>(raw_data) {
                    Ok(proof_data) => {
                        proofs.push(proof_data);
                    },
                    Err(e) => eprintln!("Error: {:?}, raw: {:?}", e, String::from_utf8_lossy(raw_data)),
                }
                println!("row_data_log{:?}", raw_data);
            }
            (AxumHttp::StatusCode::OK, Json(AccountResponce{
                id: account_id.to_string(),
                proofs: proofs,
            })).into_response()
        }
        Ok(NotFound(proof)) => (
            AxumHttp:: StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Account not found".to_string(),
            }),
        )
            .into_response(),
        Err(_) => (
            AxumHttp::StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Something went wrong".to_string(),
            }),
        )
            .into_response(),
    }
}

pub async fn apply_proof(
    State(prover): State<Arc<Prover>>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<ProofApplyPayload>,
) -> impl IntoResponse {
    debug!("Applying proof for user: {}", auth_user.user_id);
    debug!("Proof: {:?}", payload.proof);
    debug!("Provider: {}", payload.provider);
    let service = ProofServiceProvider::Reclaim(ReclaimProofService {
        data: payload.proof,
        provider: IdentityProvider::from_str(&payload.provider).unwrap(),
        prover: prover.clone(),
        auth_user: auth_user,
    });

    match service.apply_proof().await {
        Ok(_) => (AxumHttp::StatusCode::OK, AxumJson(ProofApplyResponse { success: true })).into_response(),
        Err(e) => {
            match e {
                ProofServiceError::ReclaimProofNotVerifiedError(e) => (AxumHttp::StatusCode::BAD_REQUEST, format!("{}", e)).into_response(),
                _ => (AxumHttp::StatusCode::INTERNAL_SERVER_ERROR, format!("{:?}", e)).into_response(),
            }
        },
    }
}
