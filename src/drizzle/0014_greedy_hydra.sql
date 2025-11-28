CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resolution_id` integer NOT NULL,
	`participant_id` integer NOT NULL,
	`vote` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`resolution_id`) REFERENCES `resolutions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `meeting_participants`(`id`) ON UPDATE no action ON DELETE cascade
);
