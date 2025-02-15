use crate::operations::create_account;
use prism_prover::Prover;
use std::sync::Arc;
use crate::services::jwt::JwtService;
use crate::services::signature_service::SignatureService;
use crate::services::models::{AuthError, SignInWalletPayload, AuthResult};

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

        // Generate JWT tokens
        let token_pair = JwtService::instance().create_token_pair(&body.signer)?;

        Ok(AuthResult {
            access_token: token_pair.access_token,
            refresh_token: token_pair.refresh_token,
        })
    }
}
