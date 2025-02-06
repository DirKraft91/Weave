use reclaim_rust_sdk::{ Proof as ReclaimProof, ProofNotVerifiedError as ReclaimProofNotVerifiedError };
use std::str::FromStr;
use std::string::ToString;
use serde_json::Value;
use chrono::Utc;
use thiserror::Error;

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
}

#[derive(Debug)]
struct GoogleProviderIdentityRecord {
    proof: ReclaimProof,
    email: String,
    created_at: i64,
    provider: String,
}
#[derive(Debug)]
struct XProviderIdentityRecord {
    proof: ReclaimProof,
    nickname: String,
    created_at: i64,
    provider: String,
}
#[derive(Debug)]
struct GithubProviderIdentityRecord {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug)]
struct LinkedinProviderIdentityRecord {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug)]
enum IdentityRecord {
    X(XProviderIdentityRecord),
    Google(GoogleProviderIdentityRecord),
    Github(GithubProviderIdentityRecord),
    Linkedin(LinkedinProviderIdentityRecord),
}

pub trait ProofService {
    async fn apply_proof(&self) -> Result<(), ProofServiceError>;
}

pub struct ReclaimProofService {
    pub(crate) data: ReclaimProof,
    pub(crate) provider: IdentityProvider,
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
    async fn apply_proof(&self) -> Result<(), ProofServiceError> {
        self.validate().await?;
        let tx_payload: IdentityRecord = self.prepare_payload_to_apply()?;

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

