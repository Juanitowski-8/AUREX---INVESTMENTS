-- Password reset tokens (MVP: token returned to client; email delivery can be added later)

ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(64);
ALTER TABLE users ADD COLUMN password_reset_expires_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX idx_users_password_reset_token ON users (password_reset_token);
