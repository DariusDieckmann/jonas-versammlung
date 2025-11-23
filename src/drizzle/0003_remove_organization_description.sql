-- Remove description column from organizations table
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create new table without description
CREATE TABLE organizations_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Copy data from old table to new table
INSERT INTO organizations_new (id, name, created_by, created_at, updated_at)
SELECT id, name, created_by, created_at, updated_at
FROM organizations;

-- Drop old table
DROP TABLE organizations;

-- Rename new table to original name
ALTER TABLE organizations_new RENAME TO organizations;
