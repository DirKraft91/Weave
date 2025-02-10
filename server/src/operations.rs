use std::sync::Arc;

use keystore_rs::{KeyChain, KeyStore as _};
use log::debug;
use prism_common::{
    account::Account,
    digest::Digest,
    operation::{Operation, ServiceChallenge, ServiceChallengeInput, SignatureBundle},
};
use prism_keys::{SigningKey, VerifyingKey};
use prism_prover::Prover;
use prism_tree::AccountResponse::Found;

use anyhow::{anyhow, Result};

use crate::SERVICE_ID;

pub async fn register_service(prover: Arc<Prover>) -> Result<()> {
    // First, we make sure the service is not already registered.
    if let Found(_, _) = prover.get_account(&SERVICE_ID.to_string()).await? {
        debug!("Service already registered.");
        return Ok(());
    };

    // Next we use our keystore crate to get/create a new private key for the service.
    // By default, this is stored in the operating system's keychain.
    let keystore_sk = KeyChain
        .get_signing_key(SERVICE_ID)
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;

    let sk = SigningKey::Ed25519(Box::new(keystore_sk));
    let vk: VerifyingKey = sk.verifying_key();

    // Now we create the operation to register the service. Under the hood, this
    // creates a prism account that links the service's public key to the
    // service id -- only allowing this keypair to authorize account creations
    // from the service.
    let register_op = Operation::RegisterService {
        id: SERVICE_ID.to_string(),
        creation_gate: ServiceChallenge::Signed(vk.clone()),
        key: vk,
    };

    // Because the account is new (the service does not yet exist), we create an
    // empty account to store the transaction.
    let service_account = Account::default();

    // Here we prepare the operation into a transaction by signing it with the service's private key.
    let register_tx =
        service_account.prepare_transaction(SERVICE_ID.to_string(), register_op, &sk)?;

    debug!("Submitting transaction to register test service");
    prover
        .clone()
        .validate_and_queue_update(register_tx)
        .await?;

    Ok(())
}

async fn add_key(
    user_id: String,
    prover: Arc<Prover>,
    signing_key: SigningKey,
    new_key: VerifyingKey,
) -> Result<Account> {
    if let Found(account, _) = prover.get_account(&user_id).await? {
        // We first create the operation object to be signed.
        let add_key_op = Operation::AddKey { key: new_key };

        // Then we prepare the transaction by signing the operation with the user's already existing private key.
        let mut account = account.clone();
        let add_key_tx = account.prepare_transaction(user_id.clone(), add_key_op, &signing_key)?;

        debug!("Submitting transaction to add key to account {}", &user_id);
        prover
            .clone()
            .validate_and_queue_update(add_key_tx.clone())
            .await?;

        // Finally, we process the transaction locally to avoid fetching the account again.
        account.process_transaction(&add_key_tx)?;
        return Ok(*account);
    };

    Err(anyhow!("Account {} not found", &user_id))
}

async fn add_data(
    user_id: String,
    prover: Arc<Prover>,
    signing_key: SigningKey,
    data: Vec<u8>,
    data_signature: SignatureBundle,
) -> Result<Account> {
    if let Found(account, _) = prover.get_account(&user_id).await? {
        // We first create the operation object to be signed.
        // The source of this data can either be signed by one of the user's
        // existing keys, or from an external signer referenced in
        // data_signature.
        let add_data_op = Operation::AddData {
            data,
            data_signature,
        };

        // Then we prepare the transaction by signing the operation with the user's existing private key.
        let mut account = account.clone();
        let add_data_tx =
            account.prepare_transaction(user_id.clone(), add_data_op, &signing_key)?;

        debug!("Submitting transaction to add data to account {}", &user_id);
        prover
            .clone()
            .validate_and_queue_update(add_data_tx.clone())
            .await?;

        // Finally, we process the transaction locally to avoid fetching the account again.
        account.process_transaction(&add_data_tx)?;
        return Ok(*account);
    };

    Err(anyhow!("Account {} not found", &user_id))
}

async fn create_account(user_id: String, prover: Arc<Prover>) -> Result<Account> {
    // First, we make sure the account is not already registered.
    if let Found(account, _) = prover.get_account(&user_id).await? {
        debug!("Account {} exists already", &user_id);
        return Ok(*account);
    };

    // We retrieve the test service's private key to authorize the account creation.
    let service_keystore = KeyChain
        .get_signing_key(SERVICE_ID)
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;

    let service_sk = SigningKey::Ed25519(Box::new(service_keystore));

    // We retrieve/create the user's keypair to create the account.
    // Note: Obviously, in the real world, the keypair would be handled client side.
    let user_keystore = KeyChain
        .get_signing_key(&format!("{}/{}", user_id, SERVICE_ID))
        .map_err(|e| anyhow!("Error getting key from store: {}", e))?;
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
    let signature = service_sk.sign(&hash.to_bytes());

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
    prover
        .clone()
        .validate_and_queue_update(create_acc_tx.clone())
        .await?;

    account.process_transaction(&create_acc_tx)?;
    Ok(account)
}