use tendermint::PublicKey;
use prism_client::SignatureBundle;
use prism_keys::{
    Signature,
    VerifyingKey,
    CryptoAlgorithm,
};
use serde::{Deserialize, Serialize};
use reclaim_rust_sdk::Proof as ReclaimProof;
use std::collections::HashMap;

use crate::utils::arbitrary_message::to_arbitrary_message_bytes;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserIdentityRecord {
    proof_identifier: String,
    public_data: Option<HashMap<String, String>>,
    provider_id: String,
    claim_data_params: String,
    created_at: i64,
}

impl UserIdentityRecord {
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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: String,
    pub identity_records: Vec<UserIdentityRecord>,
}

impl User {
    pub fn new(id: String, identity_records: Vec<UserIdentityRecord>) -> Self {
        Self { id, identity_records }
    }
}

pub struct UserRecord {
    pub signature_bundle: SignatureBundle,
    pub user_data: Vec<u8>,
    pub user_id: String,
}

impl UserRecord {
    pub fn new(signature_bundle: SignatureBundle, user_data: Vec<u8>, user_id: String) -> Self {
        Self { signature_bundle, user_data, user_id }
    }
}

#[derive(Debug, Clone)]
pub struct UserAminoSignedRecord {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub data: Vec<u8>,
}

impl UserAminoSignedRecord {
    pub fn new(public_key: String, signature: String, signer: String, data: Vec<u8>) -> Self {
        Self { public_key, signature, signer, data }
    }

    fn to_signature_bundle(&self) -> SignatureBundle {
        let signature_bytes = base64::decode(&self.signature)
            .expect("Failed to decode signature");
        // let rpc_signature_to_compare = hex::encode(signature_bytes.clone());
        // let signature = K256Signature::from_str(&rpc_signature_to_compare)
        //     .expect("Failed to create signature");
        let pk = PublicKey::from_raw_secp256k1(
            base64::decode(&self.public_key).expect("Failed to decode public key").as_slice()
        ).expect("Failed to create public key");
        let vk = pk.secp256k1().expect("Failed to get secp256k1 key");

        SignatureBundle::new(
            VerifyingKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, vk.to_bytes().as_slice())
                .expect("Failed to create verifying key"),
            Signature::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, &signature_bytes)
                .expect("Failed to create signature"),
        )
    }

    pub fn to_user_record(&self) -> UserRecord {
        let arbitrary_message_bytes = to_arbitrary_message_bytes(&self.signer, &base64::encode(self.data.clone()));

        UserRecord::new(self.to_signature_bundle(), arbitrary_message_bytes, self.signer.clone())
    }
}