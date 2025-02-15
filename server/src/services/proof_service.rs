use reclaim_rust_sdk::{ Proof as ReclaimProof, ProofNotVerifiedError as ReclaimProofNotVerifiedError };
use std::string::ToString;
use serde_json::Value;
use chrono::Utc;
use crate::domain::errors::proof_errors::ProofError;

use crate::domain::models::proof::{ IdentityProvider, IdentityRecord, GoogleProviderIdentityRecord, XProviderIdentityRecord, GithubProviderIdentityRecord, LinkedinProviderIdentityRecord };

pub struct ReclaimProofService {
    pub data: ReclaimProof,
    pub provider: IdentityProvider,
}

impl ReclaimProofService {
    fn prepare_identity_record(&self) -> Result<IdentityRecord, ProofError> {
        match self.provider {
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
            }
        }
    }

    async fn validate(&self) -> Result<bool, ProofError> {
        match reclaim_rust_sdk::verify_proof(&self.data).await {
            Ok(is_valid) => {
                if is_valid {
                    Ok(true)
                } else {
                    Err(ProofError::ReclaimProofNotVerifiedError(ReclaimProofNotVerifiedError("Proof is not valid".to_string())))
                }
            },
            Err(e) => Err(ProofError::ReclaimProofNotVerifiedError(e)),
        }
    }

    pub async fn validate_and_get_identity_record(&self) -> Result<Vec<u8>, ProofError> {
        self.validate().await?;

        let identity_record: IdentityRecord = self.prepare_identity_record()?;
        let json_string = serde_json::to_string(&identity_record)?;
        let data = json_string.as_bytes().to_vec();

        return Ok(data);
    }
}

