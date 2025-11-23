-- Migration: Add Organizations support
-- Allows todos and categories to be shared within an organization
-- All members of an organization can create, edit, delete and complete todos

-- Create organizations table
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Create organization_members table (junction table)
CREATE TABLE `organization_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Migrate todos table: replace user_id with organization_id and add created_by
CREATE TABLE `todos_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category_id` integer,
	`organization_id` integer NOT NULL,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`image_url` text,
	`image_alt` text,
	`completed` integer DEFAULT false NOT NULL,
	`due_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Migrate categories table: replace user_id with organization_id
CREATE TABLE `categories_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#6366f1',
	`description` text,
	`organization_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- For existing data: Create a personal organization for each user
-- and migrate their todos and categories to it
INSERT INTO `organizations` (`name`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT 
	u.name || '''s Personal Organization',
	'Personal organization for ' || u.name,
	u.id,
	datetime('now'),
	datetime('now')
FROM `user` u;
--> statement-breakpoint

-- Add each user as owner of their personal organization
INSERT INTO `organization_members` (`organization_id`, `user_id`, `role`, `joined_at`)
SELECT 
	o.id,
	o.created_by,
	'owner',
	datetime('now')
FROM `organizations` o;
--> statement-breakpoint

-- Migrate existing todos to personal organizations
INSERT INTO `todos_new` (
	`id`,
	`title`,
	`description`,
	`category_id`,
	`organization_id`,
	`created_by`,
	`status`,
	`priority`,
	`image_url`,
	`image_alt`,
	`completed`,
	`due_date`,
	`created_at`,
	`updated_at`
)
SELECT 
	t.id,
	t.title,
	t.description,
	t.category_id,
	o.id as organization_id,
	t.user_id as created_by,
	t.status,
	t.priority,
	t.image_url,
	t.image_alt,
	t.completed,
	t.due_date,
	t.created_at,
	t.updated_at
FROM `todos` t
JOIN `organizations` o ON o.created_by = t.user_id;
--> statement-breakpoint

-- Migrate existing categories to personal organizations
INSERT INTO `categories_new` (
	`id`,
	`name`,
	`color`,
	`description`,
	`organization_id`,
	`created_at`,
	`updated_at`
)
SELECT 
	c.id,
	c.name,
	c.color,
	c.description,
	o.id as organization_id,
	c.created_at,
	c.updated_at
FROM `categories` c
JOIN `organizations` o ON o.created_by = c.user_id;
--> statement-breakpoint

-- Drop old tables
DROP TABLE `todos`;
--> statement-breakpoint
DROP TABLE `categories`;
--> statement-breakpoint

-- Rename new tables
ALTER TABLE `todos_new` RENAME TO `todos`;
--> statement-breakpoint
ALTER TABLE `categories_new` RENAME TO `categories`;
