use prism_client::Signature;
use prism_prover::Prover;
use std::sync::Arc;
use keystore_rs::{KeyChain, KeyStore as _};
use log::debug;

use prism_client::{
    Account, PendingTransaction as _, PrismApi as _, SignatureBundle,
    SigningKey, VerifyingKey,
};
use crate::domain::{errors::user_errors::UserError, models::user::User};
use crate::domain::models::proof::IdentityRecord;
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
        user_id: String, 
        data: Vec<u8>,
        user_vk: VerifyingKey,
        signature: Signature,
    ) -> Result<Account, UserError> {
        if let Some(account) = self.prover.get_account(&user_id).await?.account {
            // We retrieve the test service's private key to authorize the account creation.
            let service_keystore = KeyChain
            .get_signing_key(SERVICE_ID)
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;

            let service_sk = SigningKey::Ed25519(Box::new(service_keystore));

            let signature_bundle = SignatureBundle {
                verifying_key: user_vk,
                signature,
            };
            let updated_account = self.prover
                .add_data(&account, data, signature_bundle, &service_sk)
                .await?
                .wait()
                .await?;

            Ok(updated_account)
        } else {
            Err(UserError::AccountNotFound(self.user_id.clone()))
        }
    }

    pub async fn create_user_account(self: &Self, user_id: String, user_vk: VerifyingKey, signature: Signature) -> Result<Account, UserError> {
        if let Some(account) = self.prover.get_account(&user_id).await?.account {
            debug!("Account {} exists already", &user_id);
            return Ok(account);
        }
    
        // We retrieve the test service's private key to authorize the account creation.
        let service_keystore = KeyChain
            .get_signing_key(SERVICE_ID)
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;
    
        let service_sk = SigningKey::Ed25519(Box::new(service_keystore));
    
        // Here we use the alternative API: The request builder.
        // We do this here to demonstrate the example where you can't pass a signing
        // key from the user - which should be the case for most applications.
        let unsigned_tx = self.prover
            .build_request()
            .create_account()
            .with_id(user_id.clone())
            .with_key(user_vk.clone())
            .for_service_with_id(SERVICE_ID.to_string())
            .meeting_signed_challenge(&service_sk)
            .map_err(|e| UserError::TransactionError(e.to_string()))?
            .transaction();
    
        let signature_bundle = SignatureBundle {
            verifying_key: user_vk.clone(),
            signature,
        };
        let tx = unsigned_tx.externally_signed(signature_bundle);
    
        // Because the account is new, we create an empty account to store the transaction.
        let mut account = Account::default();
        account.process_transaction(&tx)
            .map_err(|e| UserError::TransactionError(e.to_string()))?;
    
        debug!("Submitting transaction to create account {}", &user_id);
        self.prover.clone().validate_and_queue_update(tx.clone()).await
            .map_err(|e| UserError::TransactionError(e.to_string()))?;
    
        Ok(account)
    }
    
}
