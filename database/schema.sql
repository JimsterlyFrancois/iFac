-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  faculty TEXT NOT NULL,
  option TEXT NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('L1', 'L2', 'L3', 'L4')),
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_faculty ON users(faculty);
CREATE INDEX idx_users_option ON users(option);
CREATE INDEX idx_users_level ON users(level);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  target_faculty TEXT NOT NULL,
  target_option TEXT NOT NULL,
  target_level TEXT NOT NULL CHECK(target_level IN ('L1', 'L2', 'L3', 'L4', 'ALL')),
  category TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_documents_target_faculty ON documents(target_faculty);
CREATE INDEX idx_documents_target_option ON documents(target_option);
CREATE INDEX idx_documents_target_level ON documents(target_level);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Document Downloads Tracking
CREATE TABLE IF NOT EXISTS document_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE INDEX idx_downloads_user ON document_downloads(user_id);
CREATE INDEX idx_downloads_document ON document_downloads(document_id);

-- Offline Sync Queue
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'DELETE')),
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced_at);
