use prism_prover::Prover;
use std::sync::Arc;
use keystore_rs::{KeyChain, KeyStore as _};
use log::debug;

use prism_client::{
    Account, PendingTransaction as _, PrismApi, SignatureBundle,
    SigningKey,
};
use crate::domain::{
    errors::user_errors::UserError, 
    models::user::{User, UserRecord},
    models::proof::IdentityRecord
};
use crate::SERVICE_ID;

pub struct UserService {
    prover: Arc<Prover>,
    user_id: String,
}

impl UserService {
    pub fn new(prover: Arc<Prover>, user_id: String) -> Self {
        Self { prover, user_id }
    }

    pub async fn get_user(self: &Self) -> Result<User, UserError> {
        let response = self.prover.get_account(&self.user_id).await
            .map_err(|_| UserError::AccountNotFound(self.user_id.clone()))?;
        
        if let Some(account) = response.account {
            let mut proofs: Vec<IdentityRecord> = Vec::new();
            
            for signed in account.signed_data() {
                let raw_data: &Vec<u8> = &signed.data;
                match serde_json::from_slice::<IdentityRecord>(raw_data) {
                    Ok(proof_data) => {
                        proofs.push(proof_data);
                    },
                    Err(e) => eprintln!("Error: {:?}, raw: {:?}", e, String::from_utf8_lossy(raw_data)),
                }
            }
            return Ok(User::new(self.user_id.clone(), proofs));
        }
        Err(UserError::AccountNotFound(self.user_id.clone()))
    }

    pub async fn add_data_to_user_account(
        self: &Self, 
        user_record: UserRecord
    ) -> Result<Account, UserError> {
        if let Some(account) = self.prover.get_account(&user_record.user_id).await?.account {
            let service_keystore = KeyChain
                .get_or_create_signing_key(SERVICE_ID)
                .map_err(|e| UserError::KeyStoreError(e.to_string()))?;

            let service_sk = SigningKey::Ed25519(Box::new(service_keystore));
            let updated_account = self.prover
                .add_data(&account, user_record.user_data, user_record.signature_bundle, &service_sk)
                .await?
                .wait()
                .await?;

            Ok(updated_account)
        } else {
            Err(UserError::AccountNotFound(self.user_id.clone()))
        }
    }

    pub async fn create_user_account(self: &Self, signature_bundle: SignatureBundle) -> Result<Account, UserError> {
        if let Some(account) = self.prover.get_account(&self.user_id).await?.account {
            debug!("Account {} exists already", &self.user_id);
            return Ok(account);
        }
        let service_keystore = KeyChain
            .get_or_create_signing_key(SERVICE_ID)
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;
    
        let service_sk = SigningKey::Ed25519(Box::new(service_keystore));
        let unsigned_tx = self.prover
            .build_request()
            .create_account()
            .with_id(self.user_id.clone())
            .with_key(signature_bundle.verifying_key.clone())
            .for_service_with_id(SERVICE_ID.to_string())
            .meeting_signed_challenge(&service_sk)
            .map_err(|e| UserError::TransactionError(e.to_string()))?
            .transaction();


        let tx = unsigned_tx.externally_signed(signature_bundle.clone());
        let new_account = self.prover.post_transaction(tx).await?
            .wait()
            .await?;


        Ok(new_account)     
    }
    
}
