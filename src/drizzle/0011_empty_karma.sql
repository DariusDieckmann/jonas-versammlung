CREATE TABLE `agenda_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`order_index` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`requires_resolution` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resolutions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agenda_item_id` integer NOT NULL,
	`resolution_text` text NOT NULL,
	`majority_type` text DEFAULT 'simple' NOT NULL,
	`result` text,
	`votes_yes` integer DEFAULT 0 NOT NULL,
	`votes_no` integer DEFAULT 0 NOT NULL,
	`votes_abstain` integer DEFAULT 0 NOT NULL,
	`yes_shares` text,
	`no_shares` text,
	`abstain_shares` text,
	`comment` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`agenda_item_id`) REFERENCES `agenda_items`(`id`) ON UPDATE no action ON DELETE cascade
);
