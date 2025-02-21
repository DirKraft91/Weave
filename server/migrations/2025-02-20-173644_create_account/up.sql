CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(255) PRIMARY KEY,
    public_key VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS proofs (
    proof_identifier VARCHAR(255) PRIMARY KEY,
    public_data BLOB, -- Storing binary data
    email VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    provider VARCHAR(255) NOT NULL,
    raw_proof BLOB NOT NULL, -- Storing binary data
    raw_proof_hash VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL, -- Foreign key
    

    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_raw_proof_hash ON proofs(raw_proof_hash);
