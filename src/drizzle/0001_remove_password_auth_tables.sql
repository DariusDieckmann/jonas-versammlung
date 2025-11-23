-- Migration: Remove password authentication tables and columns
-- Only social login (Google, Microsoft) is used, so verification table and password column are no longer needed

-- Drop verification table (used for email verification in password auth)
DROP TABLE IF EXISTS `verification`;
--> statement-breakpoint

-- Remove password column from account table (no longer needed for social login)
-- SQLite doesn't support DROP COLUMN directly, so we need to:
-- 1. Create a new table without the password column
-- 2. Copy data from old table
-- 3. Drop old table
-- 4. Rename new table

CREATE TABLE `account_new` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Copy data from old account table to new one (excluding password column)
INSERT INTO `account_new` (
	`id`,
	`account_id`,
	`provider_id`,
	`user_id`,
	`access_token`,
	`refresh_token`,
	`id_token`,
	`access_token_expires_at`,
	`refresh_token_expires_at`,
	`scope`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	`account_id`,
	`provider_id`,
	`user_id`,
	`access_token`,
	`refresh_token`,
	`id_token`,
	`access_token_expires_at`,
	`refresh_token_expires_at`,
	`scope`,
	`created_at`,
	`updated_at`
FROM `account`;
--> statement-breakpoint

-- Drop old account table
DROP TABLE `account`;
--> statement-breakpoint

-- Rename new table to original name
ALTER TABLE `account_new` RENAME TO `account`;
