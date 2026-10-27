CREATE TABLE IF NOT EXISTS auth_users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL,
 username_lower TEXT NOT NULL UNIQUE,
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 is_admin INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 last_login_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS auth_sessions (
 token_hash TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL,
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(user_id) REFERENCES auth_users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiry ON auth_sessions(expires_at);
CREATE TABLE IF NOT EXISTS username_image_usage (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 prompt_length INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(user_id) REFERENCES auth_users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_username_image_usage_user ON username_image_usage(user_id,created_at);