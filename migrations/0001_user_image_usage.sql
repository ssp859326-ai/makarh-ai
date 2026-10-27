CREATE TABLE IF NOT EXISTS users (
  google_sub TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT NOT NULL DEFAULT (datetime('now')),
  image_count_today INTEGER NOT NULL DEFAULT 0,
  image_count_date TEXT
);

CREATE TABLE IF NOT EXISTS image_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  prompt_length INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_image_usage_sub_date
ON image_usage(google_sub, created_at);
