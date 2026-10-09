ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'User';

ALTER TABLE generated_file_history
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS entity VARCHAR(255),
    ADD COLUMN IF NOT EXISTS publication_date VARCHAR(255),
    ADD COLUMN IF NOT EXISTS year INTEGER;

CREATE INDEX IF NOT EXISTS ix_generated_file_history_user_id
    ON generated_file_history (user_id);

-- Optional: old records have no owner, so admins only see them as "unassigned".
-- To give them to an existing admin account, uncomment and set the username:
-- UPDATE generated_file_history
--    SET user_id = (SELECT id FROM users WHERE username = 'your-admin-username')
--  WHERE user_id IS NULL;