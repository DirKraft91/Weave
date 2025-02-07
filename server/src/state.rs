use crate::tx::{Transaction, TransactionType};
use anyhow::anyhow;
use anyhow::Result;
use prism_common::keys::VerifyingKey;
use std::collections::HashMap;
use std::fmt::Display;
use std::fmt::Formatter;
use std::hash::{Hash, Hasher};
use reclaim_rust_sdk::verify_proof;
use std::hash::{DefaultHasher};


#[derive(Clone)]
// TODO should this be generic enough to support not reclaimn only
pub struct WebProof {
    // TODO align provider type with reclaim
    pub provider: String,
    pub proof: reclaim_rust_sdk::Proof,
}

#[derive(Clone)]
pub struct Account {
    pub verifying_key: VerifyingKey,
    // primary key in hash map
    pub user_id: u64,
    pub account_number: String,
    pub username: String,
    pub web_proofs: Vec<WebProof>,
}

impl Account {
    pub fn get_id(&self) -> u64 {
        self.user_id.clone()
    }
}

fn generate_account_id(account_number: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    hasher.write(account_number.as_bytes());
    hasher.finish()
}

#[derive(Default)]
pub struct State {
    pub accounts: HashMap<u64, Account>,
}
impl State {
    pub fn new() -> Self {
        State { accounts: HashMap::new() }
    }
    /// Validates a transaction against the current chain state.
    /// Called during [`process_tx`], but can also be used independently, for
    /// example when queuing transactions to be batched.
    pub(crate) fn validate_tx(&self, tx: Transaction) -> Result<()> {
        tx.verify()?;
        match tx.tx_type {
            TransactionType::AddAccount { account_number, username: _ } => {
                let user_id = generate_account_id(&account_number);
                if self.accounts.contains_key(&user_id) {
                    return Err(anyhow!("account is already exists"));
                }
                Ok(())
            }
            TransactionType::DeleteAccount { user_id } => {
                match self.accounts.get(&user_id) {
                    Some(account) if account.verifying_key == tx.vk => {
                        Ok(())
                    }
                    Some(_) => Err(anyhow!("Permissions denied")),
                    None => Err(anyhow!("Cannot delete account, it doesn't exist")),
                }
            }
        }
    }
    /// Processes a transaction by validating it and updating the state.
    pub(crate) fn process_tx(&mut self, tx: Transaction) -> Result<()> {
        self.validate_tx(tx.clone())?;
        match tx.tx_type {
            TransactionType::AddAccount { account_number, username } => {
                let user_id = generate_account_id(&account_number);                
                self.accounts
                    .insert(
                        user_id,
                        Account {
                            verifying_key: tx.vk,
                            account_number: account_number,
                            web_proofs: Vec::new(),
                            user_id: user_id,
                            username: username,
                        },
                    );
                
                Ok(())
            }
            TransactionType::DeleteAccount { user_id } => {
                self.accounts.remove(&user_id);
                Ok(())
            }
        }
    }
}
