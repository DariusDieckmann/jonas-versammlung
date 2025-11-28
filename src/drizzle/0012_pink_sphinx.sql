CREATE TABLE `meeting_leaders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meeting_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`owner_name` text NOT NULL,
	`unit_number` text NOT NULL,
	`shares` integer NOT NULL,
	`is_present` integer DEFAULT false NOT NULL,
	`represented_by` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
