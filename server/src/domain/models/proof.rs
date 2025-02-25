use serde::{Deserialize, Deserializer, Serialize};
use reclaim_rust_sdk::Proof as ReclaimProof;
use std::collections::HashMap;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum IdentityProvider {
    X,
    Google,
    Github,
    Linkedin,
    Other(String),
}

impl<'de> Deserialize<'de> for IdentityProvider {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        match s.as_str() {
            "x" => Ok(IdentityProvider::X),
            "google" => Ok(IdentityProvider::Google),
            "github" => Ok(IdentityProvider::Github),
            "linkedin" => Ok(IdentityProvider::Linkedin),
            _ => Ok(IdentityProvider::Other(s)), // Preserve unknown values
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
            IdentityProvider::Other(name) => name.clone(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GoogleProviderIdentityRecord {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    email: String,
    created_at: i64,
    provider: String,
}

impl GoogleProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, email: String, created_at: i64, provider: String) -> Self {
        Self { proof_identifier: proof.identifier, public_data: proof.public_data, email, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct XProviderIdentityRecord {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    nickname: String,
    created_at: i64,
    provider: String,
}

impl XProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, nickname: String, created_at: i64, provider: String) -> Self {
        Self { proof_identifier: proof.identifier, public_data: proof.public_data, nickname, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GithubProviderIdentityRecord {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    username: String,
    created_at: i64,
    provider: String,
}

impl GithubProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, username: String, created_at: i64, provider: String) -> Self {
        Self { proof_identifier: proof.identifier, public_data: proof.public_data, username, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LinkedinProviderIdentityRecord {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    username: String,
    created_at: i64,
    provider: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GenericProviderIdentityRecord {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    provider: String,
    created_at: i64,
}

impl LinkedinProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, username: String, created_at: i64, provider: String) -> Self {
        Self { proof_identifier: proof.identifier, public_data: proof.public_data, username, created_at, provider }
    }
}

impl GenericProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, created_at: i64, provider: String) -> Self {
        let public_data = proof.public_data.clone();
        Self {
            proof_identifier: proof.identifier,
            provider,
            created_at,
            public_data: public_data,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum IdentityRecord {
    X(XProviderIdentityRecord),
    Google(GoogleProviderIdentityRecord),
    Github(GithubProviderIdentityRecord),
    Linkedin(LinkedinProviderIdentityRecord),
    Generic(GenericProviderIdentityRecord),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IdentityRecordV2 {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    provider_id: String,
    claim_data_params: String,
    created_at: i64,
}

impl IdentityRecordV2 {
    pub fn new(proof: ReclaimProof, created_at: i64, provider_id: String) -> Self {
        let public_data = proof.public_data.clone();
        Self {
            proof_identifier: proof.identifier,
            provider_id,
            created_at,
            public_data: public_data,
            claim_data_params: proof.claim_data.parameters,
        }
    }
}