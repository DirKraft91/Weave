use prism_prover::Prover;
use std::sync::Arc;
use keystore_rs::{KeyChain, KeyStore as _};
use log::debug;
use prism_common::{
    account::Account,
    digest::Digest,
    operation::{Operation, ServiceChallengeInput, SignatureBundle},
};
use prism_keys::{SigningKey, VerifyingKey};
use prism_tree::AccountResponse::Found;
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
        if let Found(account, _) = self.prover.get_account(&self.user_id).await
            .map_err(|_| UserError::AccountNotFound(self.user_id.clone()))? {

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

    pub async fn add_data_to_user_account(self: &Self, data: Vec<u8>) -> Result<Account, UserError> {
        if let Found(account, _) = self.prover.get_account(&self.user_id).await
            .map_err(|_| UserError::AccountNotFound(self.user_id.clone()))? {
        
            
            let user_keystore = KeyChain
                .get_signing_key(&format!("{}/{}", self.user_id, SERVICE_ID))
                .map_err(|e| UserError::KeyStoreError(e.to_string()))?;

            let user_sk = SigningKey::Ed25519(Box::new(user_keystore));
            let user_vk = user_sk.verifying_key();
            let hash = Digest::hash(&data);
            let signature = user_sk.sign(&hash.to_bytes());

            let signature_bundle = SignatureBundle { 
                verifying_key: user_vk, 
                signature: signature
            };

            let add_data_op = Operation::AddData { 
                data: data.clone(), 
                data_signature: signature_bundle
            };

            let mut account = account.clone();
            let add_data_tx = account.prepare_transaction(self.user_id.clone(), add_data_op, &user_sk)?;
            self.prover.clone().validate_and_queue_update(add_data_tx.clone()).await?;
            account.process_transaction(&add_data_tx)?;

            return Ok(*account);
        }
        Err(UserError::AccountNotFound(self.user_id.clone()))
    }

    pub async fn create_user_account(self: &Self, user_id: String) -> Result<Account, UserError> {
        // First, we make sure the account is not already registered.
        if let Found(account, _) = self.prover.get_account(&user_id).await? {
            debug!("Account {} exists already", &user_id);
            return Ok(*account);
        };
    
        // We retrieve the test service's private key to authorize the account creation.
        let service_keystore = KeyChain
            .get_signing_key(SERVICE_ID)
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;
    
        let service_sk = SigningKey::Ed25519(Box::new(service_keystore));
    
        // We retrieve/create the user's keypair to create the account.
        // Note: Obviously, in the real world, the keypair would be handled client side.
        let user_keystore = KeyChain
            .get_or_create_signing_key(&format!("{}/{}", user_id, SERVICE_ID))
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;
        let user_sk = SigningKey::Ed25519(Box::new(user_keystore));
        let user_vk: VerifyingKey = user_sk.verifying_key();
    
        // Sign account creation credentials with test service's signing key.
        // This is set as the "challenge" in the CreateAccount operation, which is
        // what gets verified+proved by the prover before inclusion
        let hash = Digest::hash_items(&[
            user_id.as_bytes(),
            SERVICE_ID.as_bytes(),
            &user_vk.to_bytes(),
        ]);
        let signature: prism_keys::Signature = service_sk.sign(&hash.to_bytes());
    
        // Now that the service has authorized the account creation, we can
        // construct, prepare, and submit the transaction to create the account.
        let create_acc_op = Operation::CreateAccount {
            id: user_id.clone(),
            service_id: SERVICE_ID.to_string(),
            challenge: ServiceChallengeInput::Signed(signature),
            key: user_vk,
        };
    
        // Because the account is new, we create an empty account to store the transaction.
        let mut account = Account::default();
        let create_acc_tx = account.prepare_transaction(user_id.clone(), create_acc_op, &user_sk)?;
    
        debug!("Submitting transaction to create account {}", &user_id);
        self.prover
            .clone()
            .validate_and_queue_update(create_acc_tx.clone())
            .await?;
    
        account.process_transaction(&create_acc_tx)?;
        Ok(account)
    }
    
}
