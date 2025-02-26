CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    public_key VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS proofs (
    provider_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Foreign key
    raw_data BLOB, -- Storing binary data
    raw_data_hash VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_raw_data_hash ON proofs(raw_data_hash);
