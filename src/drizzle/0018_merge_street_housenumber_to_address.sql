-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- Step 1: Create a new table with the correct structure
CREATE TABLE `properties_new` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `organization_id` integer NOT NULL,
    `name` text NOT NULL,
    `address` text NOT NULL,
    `postal_code` text NOT NULL,
    `city` text NOT NULL,
    `year_built` integer,
    `number_of_units` integer,
    `total_area` integer,
    `notes` text,
    `created_at` text NOT NULL,
    `updated_at` text NOT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Step 2: Copy data from old table, combining street and house_number
INSERT INTO `properties_new` (
    `id`,
    `organization_id`,
    `name`,
    `address`,
    `postal_code`,
    `city`,
    `year_built`,
    `number_of_units`,
    `total_area`,
    `notes`,
    `created_at`,
    `updated_at`
)
SELECT 
    `id`,
    `organization_id`,
    `name`,
    `street` || ' ' || `house_number` as `address`,
    `postal_code`,
    `city`,
    `year_built`,
    `number_of_units`,
    `total_area`,
    `notes`,
    `created_at`,
    `updated_at`
FROM `properties`;
--> statement-breakpoint

-- Step 3: Drop old table
DROP TABLE `properties`;
--> statement-breakpoint

-- Step 4: Rename new table to original name
ALTER TABLE `properties_new` RENAME TO `properties`;