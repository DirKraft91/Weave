// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        #[max_length = 255]
        id -> Varchar,
        #[max_length = 255]
        public_key -> Varchar,
        created_at -> Bigint,
    }
}

diesel::table! {
    proofs (proof_identifier) {
        #[max_length = 255]
        proof_identifier -> Varchar,
        public_data -> Nullable<Blob>,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 255]
        username -> Varchar,
        created_at -> Bigint,
        #[max_length = 255]
        provider -> Varchar,
        raw_proof -> Blob,
        #[max_length = 255]
        raw_proof_hash -> Varchar,
        #[max_length = 255]
        account_id -> Varchar,
    }
}

diesel::joinable!(proofs -> accounts (account_id));

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    proofs,
);
