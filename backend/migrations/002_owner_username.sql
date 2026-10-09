-- Stores the username on each history row, so it stays visible after the user is deleted.
ALTER TABLE generated_file_history
    ADD COLUMN IF NOT EXISTS owner_username VARCHAR(100);

-- Fill it in for existing rows that still have an owner.
UPDATE generated_file_history h
   SET owner_username = u.username
  FROM users u
 WHERE h.user_id = u.id
   AND h.owner_username IS NULL;