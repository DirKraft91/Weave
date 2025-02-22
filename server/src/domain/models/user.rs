use crate::domain::models::proof::IdentityRecord;
use prism_client::SignatureBundle;
use prism_keys::{
    Signature,
    VerifyingKey,
    CryptoAlgorithm,
};

pub struct User {
    pub id: String,
    pub proofs: Vec<IdentityRecord>,
}

impl User {
    pub fn new(id: String, proofs: Vec<IdentityRecord>) -> Self {
        Self { id, proofs }
    }
}

pub struct UserAminoSignedRecord {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub data: String,
}

struct UserRecord {
    pub signature_bundle: SignatureBundle,
    pub user_data: Vec<u8>,
    pub user_id: String,
}

impl UserAminoSignedRecord {
    pub fn new(public_key: String, signature: String, signer: String, data: String) -> Self {
        Self { public_key, signature, signer, data }
    }

    fn generate_amino_message(signer: &str, data: &str) -> String {
        format!(
            "{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\
            \"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\
            \"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}",
            data, signer
        )
    }

    fn to_signature_bundle(&self) -> SignatureBundle {
        SignatureBundle {
            verifying_key: VerifyingKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, &base64::decode(&self.public_key).unwrap()).unwrap(),
            signature: Signature::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, &base64::decode(&self.signature).unwrap()).unwrap(),
        }
    }

    pub fn to_user_record(&self) -> UserRecord {
        let amino_message = Self::generate_amino_message(&self.signer, &self.data);

        UserRecord {
            signature_bundle: self.to_signature_bundle(),
            user_data: base64::decode(&amino_message).unwrap(),
            user_id: self.signer.clone(),
        }
    }
}

