ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE sessions ADD COLUMN user_id INTEGER REFERENCES users(id);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE auth_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE bootstrap (id INTEGER PRIMARY KEY CHECK(id=1));
