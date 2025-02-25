use chrono::Utc;
use reclaim_rust_sdk::Proof as ReclaimProof;
use std::string::ToString;
use crate::domain::errors::proof_errors::ProofError;
use crate::domain::models::user::UserIdentityRecord;

#[async_trait::async_trait]
pub trait ProofValidator {
    async fn validate(&self, proof: &ReclaimProof) -> Result<bool, ProofError>;
}

pub struct ProofService<V: ProofValidator> {
    pub data: ReclaimProof,
    pub validator: V,
    pub provider_id: String,
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
    async fn validate(&self) -> Result<bool, ProofError> {
        self.validator.validate(&self.data).await
    }

    pub async fn validate_and_get_data_to_sign(&self) -> Result<Vec<u8>, ProofError> {
        self.validate().await?;

        let identity_record: UserIdentityRecord = UserIdentityRecord::new(
            self.data.clone(), 
            Utc::now().timestamp(), 
            self.provider_id.clone()
        );

        
        let json_string = serde_json::to_string(&identity_record)?;
        let data = json_string.as_bytes().to_vec();

        return Ok(data);
    }
}

