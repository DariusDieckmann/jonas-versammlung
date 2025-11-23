-- Add properties table for real estate management
CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` integer NOT NULL,
	`name` text NOT NULL,
	`street` text NOT NULL,
	`house_number` text NOT NULL,
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