use axum::{
    response::IntoResponse,
    http::{self as AxumHttp, StatusCode},
    Json,
};
use chrono::{Duration as ChronoDuration, Utc};
use ecdsa::signature::DigestVerifier;
use jsonwebtoken::{encode, EncodingKey, Header};
use k256::sha2::{Digest, Sha256};
use serde::{Deserialize, Serialize};
use std::fmt::Error;
use std::str::FromStr;
use tendermint::PublicKey;

#[derive(Serialize, Deserialize)]
pub struct SignInWalletPayload {
    pub public_key: String,
    pub signature: String,
    pub signer: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
struct Claims {
    sub: String,  // subject (address)
    exp: i64,     // expiration time
    iat: i64,     // issued at
}

#[derive(Serialize)]
struct SignInWalletResponse {
    auth: bool,
}

pub async fn auth(Json(body): Json<SignInWalletPayload>) -> impl IntoResponse {
    AuthService::sign_in_wallet(body).await
}

pub struct AuthService;

impl AuthService {
    pub async fn sign_in_wallet(body: SignInWalletPayload) -> impl IntoResponse {
        match Self::verify_arbitrary(
            &body.signer,
            &body.public_key,
            &body.signature,
            &body.message.as_bytes(),
        ) {
            Ok(_) => {
                let expiration = Utc::now()
                    .checked_add_signed(ChronoDuration::hours(24))
                    .expect("valid timestamp")
                    .timestamp();

                let claims = Claims {
                    sub: body.signer.clone(),
                    exp: expiration,
                    iat: Utc::now().timestamp(),
                };

                let token = encode(
                    &Header::default(),
                    &claims,
                    &EncodingKey::from_secret("your-secret-key".as_bytes()), // TODO: move to env variable
                )
                .unwrap();

                let auth_header = format!("Bearer {}", token);

                let response = SignInWalletResponse { auth: true };

                (
                    StatusCode::OK,
                    [(AxumHttp::header::AUTHORIZATION, auth_header)],
                    Json(response),
                )
                    .into_response()
            }
            Err(e) => (
                StatusCode::UNAUTHORIZED,
                [(AxumHttp::header::WWW_AUTHENTICATE, "Bearer")],
                format!("{}", e),
            )
                .into_response(),
        }
    }

    fn verify_arbitrary(
        account_addr: &str,
        public_key: &str,
        signature: &str,
        data: &[u8],
    ) -> Result<(), Error> {
        let rpc_signature_to_compare = hex::encode(base64::decode(&signature).unwrap());
        let signature: k256::ecdsa::Signature =
            ecdsa::Signature::from_str(&rpc_signature_to_compare).unwrap();
        let digest = Sha256::new_with_prefix(Self::generate_amino_transaction_string(
            account_addr,
            &base64::encode(data),
        ));
        let pk = PublicKey::from_raw_secp256k1(base64::decode(public_key).unwrap().as_slice())
            .unwrap();
        let vk = pk.secp256k1().unwrap();

        vk.verify_digest(digest, &signature).map_err(|_| Error)
    }

    fn generate_amino_transaction_string(signer: &str, data: &str) -> String {
        format!(
            "{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\
            \"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\
            \"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}",
            data, signer
        )
    }
}
