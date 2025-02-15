use ecdsa::signature::DigestVerifier;
use k256::sha2::{Digest, Sha256};
use std::str::FromStr;
use tendermint::PublicKey;
use crate::services::models::{AuthError};

pub struct SignatureService;

impl SignatureService {
    pub fn verify_signature(
        account_addr: &str,
        public_key: &str,
        signature: &str,
        data: &[u8],
    ) -> Result<(), AuthError> {
        let signature_bytes = base64::decode(signature)?;
        let rpc_signature_to_compare = hex::encode(signature_bytes);
        let signature = ecdsa::Signature::from_str(&rpc_signature_to_compare)
            .map_err(|e| AuthError::SignatureError(e.to_string()))?;

        let message = Self::generate_amino_message(account_addr, &base64::encode(data));
        let digest = Sha256::new_with_prefix(message);

        let pk = PublicKey::from_raw_secp256k1(
            base64::decode(public_key)?.as_slice()
        ).ok_or(AuthError::PublicKeyError)?;
        
        let vk = pk.secp256k1()
            .ok_or_else(|| AuthError::PublicKeyError)?;

        vk.verify_digest(digest, &signature)
            .map_err(|_| AuthError::SignatureError("Invalid signature".to_string()))
    }

    fn generate_amino_message(signer: &str, data: &str) -> String {
        format!(
            "{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\
            \"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\
            \"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}",
            data, signer
        )
    }
}