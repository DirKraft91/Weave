use prism_prover::Prover;
use std::sync::Arc;
use keystore_rs::{KeyChain, KeyStore as _};
use log::debug;

use prism_client::{
    Account, PendingTransaction, PrismApi, SignatureBundle, SigningKey
};
use crate::{domain::{
    errors::user_errors::UserError, 
    models::user::{User, UserIdentityRecord, UserRecord},
}, utils::arbitrary_message::from_arbitrary_message_bytes_to_data_structure};
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
            let mut identity_records: Vec<UserIdentityRecord> = Vec::new();
            for signed in account.signed_data().iter() {
                match from_arbitrary_message_bytes_to_data_structure::<UserIdentityRecord>(&signed.data.clone()) {
                    Ok(identity_record) => {
                        identity_records.push(identity_record);
                    },
                    Err(e) => debug!("Error parsing arbitrary message: {:?}", e),
                }
            }
            return Ok(User::new(self.user_id.clone(), identity_records));
        }
        Err(UserError::AccountNotFound(self.user_id.clone()))
    }

    pub async fn add_data_to_user_account(
        self: &Self, 
        user_record: UserRecord
    ) -> Result<Account, UserError> {
        if let Some(account) = self.prover.get_account(&user_record.user_id).await?.account {
            // verify user_record.signature_bundle to be sure that client have signed data
            match user_record.signature_bundle.verifying_key.verify_signature(&user_record.user_data, &user_record.signature_bundle.signature) {
                Ok(_) => {
                    debug!("Add data to user account has valid signature");
                },
                Err(e) => return Err(UserError::InvalidSignature(format!("Invalid signature: {:?}", e))),
            }

            let user_keystore = KeyChain
                .get_or_create_signing_key(&format!("{}/{}", self.user_id.clone(), SERVICE_ID))
                .map_err(|e| UserError::KeyStoreError(e.to_string()))?;
            let user_sk = SigningKey::Ed25519(Box::new(user_keystore));
            let user_vk = user_sk.verifying_key();
            let signature = user_sk.sign(&user_record.user_data);
            let signature_bundle = SignatureBundle::new(user_vk, signature);

            let updated_account = self.prover
                .add_data(&account, user_record.user_data.clone(), signature_bundle, &user_sk)
                .await?
                .wait()
                .await?;

            println!("updated_account: {:?}", updated_account);

            Ok(updated_account)
        } else {
            Err(UserError::AccountNotFound(self.user_id.clone()))
        }
    }

    pub async fn create_user_account(self: &Self, user_record: UserRecord) -> Result<Account, UserError> {
        if let Some(account) = self.prover.get_account(&self.user_id).await?.account {
            debug!("Account {} exists already", &self.user_id);
            return Ok(account);
        }
        // verify user_record.signature_bundle to be sure that client have signed data
        user_record.signature_bundle.verifying_key.verify_signature(&user_record.user_data, &user_record.signature_bundle.signature)
            .map_err(|_| UserError::InvalidSignature(format!("Invalid signature: {:?}", user_record.signature_bundle.signature)))?;

        let service_keystore = KeyChain
            .get_or_create_signing_key(SERVICE_ID)
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;

        let service_sk = SigningKey::Ed25519(Box::new(service_keystore));

        let user_keystore = KeyChain
            .get_or_create_signing_key(&format!("{}/{}", self.user_id.clone(), SERVICE_ID))
            .map_err(|e| UserError::KeyStoreError(e.to_string()))?;
        let user_sk = SigningKey::Ed25519(Box::new(user_keystore));

        let new_account = self.prover
            .create_account(self.user_id.clone(), SERVICE_ID.to_string(), &service_sk, &user_sk)
            .await?
            .wait()
            .await?;

        // let unsigned_tx = self.prover
        //     .build_request()
        //     .create_account()
        //     .with_id(self.user_id.clone())
        //     .with_key(signature_bundle.verifying_key.clone())
        //     .for_service_with_id(SERVICE_ID.to_string())
        //     .meeting_signed_challenge(&service_sk)
        //     .map_err(|e| UserError::TransactionError(e.to_string()))?
        //     .transaction();


        // let tx = unsigned_tx.externally_signed(signature_bundle.clone());
        // let new_account = self.prover.post_transaction(tx).await?
        //     .wait()
        //     .await?;


        Ok(new_account)     
    }
    
}
