use keystore_rs::KeyChain;
use tendermint::PublicKey;
use crate::{domain::errors::auth_errors::AuthError, SERVICE_ID};
use prism_keys::{
    VerifyingKey,
    CryptoAlgorithm,
};
use prism_client::{
    PrismApi,
    SigningKey,
};

use prism_prover::Prover;
use std::sync::Arc;
use keystore_rs::KeyStore as _;

pub struct AuthService {
    prover: Arc<Prover>,
}

pub struct PreparedAuthData {
    pub data: Vec<u8>
}

impl AuthService {
    pub fn new(prover: Arc<Prover>) -> Self {
        Self { prover }
    }

    pub fn prepare_auth_data(self: &Self, signer: String, public_key: String) -> Result<PreparedAuthData, AuthError> {
        let service_keystore = KeyChain
            .get_or_create_signing_key(SERVICE_ID)
            .map_err(|e| AuthError::KeyStoreError(e.to_string()))?;

        let service_sk = SigningKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, &service_keystore.to_bytes())?;
        let user_pk = PublicKey::from_raw_secp256k1(
            base64::decode(&public_key)?.as_slice()
        ).ok_or(AuthError::PublicKeyError)?;
        
        let vk  = user_pk.secp256k1()
            .ok_or_else(|| AuthError::PublicKeyError)?;
        let user_vk = VerifyingKey::from_algorithm_and_bytes(CryptoAlgorithm::Secp256k1, vk.to_bytes().as_slice()).unwrap();

        let unsigned_tx = self.prover
            .build_request()
            .create_account()
            .with_id(signer.clone())
            .with_key(user_vk)
            .for_service_with_id(SERVICE_ID.to_string())
            .meeting_signed_challenge(&service_sk)
            .map_err(|e| AuthError::PrepareAuthDataError(e.to_string()))?
            .transaction();
        let bytes_to_sign = unsigned_tx.signing_payload()?;
        
        Ok(PreparedAuthData {
            data: bytes_to_sign,
        })
    }
}

