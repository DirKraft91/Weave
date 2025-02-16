use serde::{Deserialize, Serialize};
use reclaim_rust_sdk::Proof as ReclaimProof;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IdentityProvider {
    X,
    Google,
    Github,
    Linkedin
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GoogleProviderIdentityRecord {
    proof: ReclaimProof,
    email: String,
    created_at: i64,
    provider: String,
}

impl GoogleProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, email: String, created_at: i64, provider: String) -> Self {
        Self { proof, email, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct XProviderIdentityRecord {
    proof: ReclaimProof,
    nickname: String,
    created_at: i64,
    provider: String,
}

impl XProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, nickname: String, created_at: i64, provider: String) -> Self {
        Self { proof, nickname, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GithubProviderIdentityRecord {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
    provider: String,
}

impl GithubProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, username: String, created_at: i64, provider: String) -> Self {
        Self { proof, username, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LinkedinProviderIdentityRecord {
    proof: ReclaimProof,
    username: String,
    created_at: i64,
    provider: String,
}

impl LinkedinProviderIdentityRecord {
    pub fn new(proof: ReclaimProof, username: String, created_at: i64, provider: String) -> Self {
        Self { proof, username, created_at, provider }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum IdentityRecord {
    X(XProviderIdentityRecord),
    Google(GoogleProviderIdentityRecord),
    Github(GithubProviderIdentityRecord),
    Linkedin(LinkedinProviderIdentityRecord),
}