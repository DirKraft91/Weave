use ecdsa::signature::DigestVerifier;
use k256::sha2::{Digest, Sha256};
use std::str::FromStr;
use tendermint::PublicKey;
use crate::domain::errors::auth_errors::AuthError;
use crate::api::dto::request::auth_req::AuthWalletRequestDto;
use prism_keys::{
    Signature, 
    VerifyingKey,
    CryptoAlgorithm,
};

struct VerifyWalletAminoSignatureResult {
    pub user_vk: VerifyingKey,
    pub signature: Signature,
}


pub struct AuthService;

fn generate_amino_message(signer: &str, data: &str) -> String {
    format!(
        "{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\
        \"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\
        \"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}",
        data, signer
    )
}

impl AuthService {
    pub fn verify_wallet_signature(payload: &AuthWalletRequestDto) -> Result<VerifyWalletAminoSignatureResult, AuthError> {
        let signature_bytes = base64::decode(&payload.signature)?;
        let rpc_signature_to_compare = hex::encode(signature_bytes);
        let signature = ecdsa::Signature::from_str(&rpc_signature_to_compare)
            .map_err(|e| AuthError::SignatureError(e.to_string()))?;

        let message = generate_amino_message(&payload.signer, &base64::encode(&payload.message));
        let digest = Sha256::new_with_prefix(message.as_str());

        let pk = PublicKey::from_raw_secp256k1(
            base64::decode(&payload.public_key)?.as_slice()
        ).ok_or(AuthError::PublicKeyError)?;
        
        let vk  = pk.secp256k1()
            .ok_or_else(|| AuthError::PublicKeyError)?;

        vk.verify_digest(digest, &signature)
            .map_err(|_| AuthError::SignatureError("Invalid signature".to_string()))?;

        Ok(VerifyWalletAminoSignatureResult {
            user_vk: VerifyingKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, vk.to_bytes().as_slice()).unwrap(),
            signature: Signature::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, signature.to_vec().as_slice()).unwrap(),
        })
    }
}

