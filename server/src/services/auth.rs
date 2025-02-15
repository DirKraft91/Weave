use crate::operations::create_account;
use prism_prover::Prover;
use std::sync::Arc;
use crate::services::jwt::JwtService;
use crate::services::signature_service::SignatureService;
use crate::services::models::{AuthError, SignInWalletPayload};

// Types for auth result
#[derive(Debug)]
pub struct AuthResult {
    pub token: String,
}

// Auth Service
pub struct AuthService;

impl AuthService {
    pub async fn sign_in_wallet(
        prover: Arc<Prover>,
        body: SignInWalletPayload,
    ) -> Result<AuthResult, AuthError> {
        // Verify signature
        SignatureService::verify_signature(
            &body.signer,
            &body.public_key,
            &body.signature,
            &body.message.as_bytes(),
        )?;

        // Create account
        create_account(body.signer.clone(), prover)
            .await
            .map_err(|e| AuthError::AccountCreationError(e.to_string()))?;

        // Generate JWT token
        let token = JwtService::create_token(&body.signer)?;
        
        Ok(AuthResult {
            token,
        })
    }
}

