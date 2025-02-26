// @generated automatically by Diesel CLI.

diesel::table! {
    proofs (provider_id) {
        #[max_length = 255]
        provider_id -> Varchar,
        #[max_length = 255]
        user_id -> Varchar,
        raw_data -> Nullable<Blob>,
        #[max_length = 255]
        raw_data_hash -> Varchar,
        created_at -> Bigint,
    }
}

diesel::table! {
    users (id) {
        #[max_length = 255]
        id -> Varchar,
        #[max_length = 255]
        public_key -> Varchar,
        created_at -> Bigint,
    }
}

diesel::joinable!(proofs -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    proofs,
    users,
);
