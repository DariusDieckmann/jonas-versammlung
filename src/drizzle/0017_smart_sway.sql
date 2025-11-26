CREATE TABLE `agenda_item_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agenda_item_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`r2_url` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`agenda_item_id`) REFERENCES `agenda_items`(`id`) ON UPDATE no action ON DELETE cascade
);
