use reclaim_rust_sdk::{ Proof as ReclaimProof };
use std::string::ToString;
use serde_json::Value;
use chrono::Utc;
use crate::domain::errors::proof_errors::ProofError;
use crate::domain::models::proof::{ GenericProviderIdentityRecord, GithubProviderIdentityRecord, GoogleProviderIdentityRecord, IdentityProvider, IdentityRecord, LinkedinProviderIdentityRecord, XProviderIdentityRecord };

#[async_trait::async_trait]
pub trait ProofValidator {
    async fn validate(&self, proof: &ReclaimProof) -> Result<bool, ProofError>;
}

pub struct ProofService<V: ProofValidator> {
    pub data: ReclaimProof,
    pub provider: IdentityProvider,
    pub validator: V,
}

pub struct ReclaimProofValidator;

#[async_trait::async_trait]
impl ProofValidator for ReclaimProofValidator {
    async fn validate(&self, proof: &ReclaimProof) -> Result<bool, ProofError> {
        match reclaim_rust_sdk::verify_proof(proof).await {
            Ok(is_valid) => {
                if is_valid {
                    Ok(true)
                } else {
                    Err(ProofError::ProofNotVerifiedError(
                        "Proof is not valid".to_string(),
                    ))
                }
            }
            Err(e) => Err(ProofError::ProofNotVerifiedError(e.to_string())),
        }
    }
}

impl<V: ProofValidator> ProofService<V> {
    fn prepare_identity_record(&self) -> Result<IdentityRecord, ProofError> {
        match &self.provider {
            IdentityProvider::X => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofError::ContextDeserializationError)?;

                let nickname = context["extractedParameters"]["screen_name"]
                    .as_str()
                    .ok_or(ProofError::ScreenNameNotFound)?
                    .to_string();

                Ok(IdentityRecord::X(XProviderIdentityRecord::new(
                    self.data.clone(),
                    nickname,
                    Utc::now().timestamp(),
                    self.provider.to_string()
                )))
            },
            IdentityProvider::Google => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofError::ContextDeserializationError)?;

                let email = context["extractedParameters"]["email"]
                    .as_str()
                    .ok_or(ProofError::EmailNotFound)?
                    .trim_matches('"')
                    .to_lowercase();

                Ok(IdentityRecord::Google(GoogleProviderIdentityRecord::new(
                    self.data.clone(),
                    email,
                    Utc::now().timestamp(),
                    self.provider.to_string()
                )))
            },
            IdentityProvider::Github => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofError::ContextDeserializationError)?;

                let username = context["extractedParameters"]["username"]
                    .as_str()
                    .ok_or(ProofError::UsernameNotFound)?
                    .to_string();

                Ok(IdentityRecord::Github(GithubProviderIdentityRecord::new(
                    self.data.clone(),
                    username,
                    Utc::now().timestamp(),
                    self.provider.to_string()
                )))
            },
            IdentityProvider::Linkedin => {
                let context: Value = serde_json::from_str(&self.data.claim_data.context)
                .map_err(ProofError::ContextDeserializationError)?;

                let username = context["extractedParameters"]["Username"]
                    .as_str()
                    .ok_or(ProofError::UsernameNotFound)?
                    .to_string();

                Ok(IdentityRecord::Linkedin(LinkedinProviderIdentityRecord::new(
                    self.data.clone(),
                    username,
                    Utc::now().timestamp(),
                    self.provider.to_string()
                )))
            },
            IdentityProvider::Other(name) => {
                Ok(IdentityRecord::Generic(GenericProviderIdentityRecord::new(
                    self.data.clone(),
                    Utc::now().timestamp(),
                    self.provider.to_string()
                )))
            }
        }
    }

    async fn validate(&self) -> Result<bool, ProofError> {
        self.validator.validate(&self.data).await
    }

    pub async fn validate_and_get_identity_record(&self) -> Result<Vec<u8>, ProofError> {
        self.validate().await?;

        let identity_record: IdentityRecord = self.prepare_identity_record()?;
        let json_string = serde_json::to_string(&identity_record)?;
        let data = json_string.as_bytes().to_vec();

        return Ok(data);
    }
}

