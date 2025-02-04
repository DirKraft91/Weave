use reclaim_rust_sdk::{ Proof as ReclaimProof, ProofNotVerifiedError as ReclaimProofNotVerifiedError };
use std::str::FromStr;
use serde_json::Value;
use chrono::{ Utc };
use thiserror::Error;

pub enum TxPayloadProvider {
    X,
    Google,
    Github,
}

impl FromStr for TxPayloadProvider {
    type Err = String;  // Custom error type

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "x" => Ok(TxPayloadProvider::X),
            "google" => Ok(TxPayloadProvider::Google),
            "github" => Ok(TxPayloadProvider::Github),
            _ => Err(format!("Invalid provider: {}", s)),
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
}

#[derive(Debug)]
struct GooggleProviderTxPayload {
    proof: ReclaimProof,
    email: String,
    created_at: i64,
}
#[derive(Debug)]
struct XProviderTxPayload {
    proof: ReclaimProof,
    nickname: String,
    created_at: i64,
}
#[derive(Debug)]
struct GithubProviderTxPayload {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
}

#[derive(Debug)]
enum TxPayload {
    X(XProviderTxPayload),
    Google(GooggleProviderTxPayload),
    Github(GithubProviderTxPayload),
}

pub trait ProofService {
    async fn apply_proof(&self) -> Result<(), ProofServiceError>;
}

pub struct ReclaimProofService {
    pub(crate) data: ReclaimProof,
    pub(crate) provider: TxPayloadProvider,
}

impl ReclaimProofService {
    fn prepare_payload_to_apply(&self) -> Result<TxPayload, ProofServiceError> {
        match self.provider {
            TxPayloadProvider::X => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let nickname = context["extractedParameters"]["screen_name"]
                    .as_str()
                    .ok_or(ProofServiceError::ScreennameNotFound)?
                    .to_string();

                Ok(TxPayload::X(XProviderTxPayload {
                    proof: self.data.clone(),
                    nickname,
                    created_at: Utc::now().timestamp(),
                }))
            },
            TxPayloadProvider::Google => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let email = context["extractedParameters"]["email"]
                    .as_str()
                    .ok_or(ProofServiceError::EmailNotFound)?
                    .to_string();

                Ok(TxPayload::Google(GooggleProviderTxPayload {
                    proof: self.data.clone(),
                    email,
                    created_at: Utc::now().timestamp(),
                }))
            },
            TxPayloadProvider::Github => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofServiceError::ContextDeserializationError)?;

                let username = context["extractedParameters"]["username"]
                    .as_str()
                    .ok_or(ProofServiceError::UsernameNotFound)?
                    .to_string();

                Ok(TxPayload::Github(GithubProviderTxPayload {
                    proof: self.data.clone(),
                    username,
                    created_at: Utc::now().timestamp(),
                }))
            },
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
    async fn apply_proof(&self) -> Result<(), ProofServiceError> {
        self.validate().await?;
        let tx_payload = self.prepare_payload_to_apply().unwrap();

        println!("tx_payload: {:?}", tx_payload);
        Ok(())
    }
}

enum ProofServiceProvider {
    Reclaim(ReclaimProofService),
}
impl ProofService for ProofServiceProvider {
    async fn apply_proof(&self) -> Result<(), ProofServiceError> {
        match self {
            ProofServiceProvider::Reclaim(state) => state.apply_proof().await,
        }
    }
}

