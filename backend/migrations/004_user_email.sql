ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Emails are unique, ignoring capitals. Users without an email are
-- stored as NULL, and PostgreSQL allows several NULLs.
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower
    ON users (lower(email));