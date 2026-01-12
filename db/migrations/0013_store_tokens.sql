-- Migration: create tokens table for server-side session storage

CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Optional: create index on token for fast lookup
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
