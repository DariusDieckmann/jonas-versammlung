-- Re-add verification table for better-auth standard schema
CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX idx_verification_identifier ON verification(identifier);
