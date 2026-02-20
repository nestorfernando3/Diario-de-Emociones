CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  api_key TEXT,
  api_provider TEXT DEFAULT 'openai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  situation TEXT NOT NULL,
  feeling TEXT NOT NULL,
  feeling_intensity INTEGER DEFAULT 50,
  automatic_thought TEXT,
  evidence_for TEXT,
  evidence_against TEXT,
  alternative_thought TEXT,
  re_rating INTEGER,
  mood_color TEXT DEFAULT '#6366f1',
  tags TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
