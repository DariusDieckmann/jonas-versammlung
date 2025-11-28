PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_meeting_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`owner_name` text NOT NULL,
	`unit_number` text NOT NULL,
	`shares` integer NOT NULL,
	`attendance_status` text DEFAULT 'absent' NOT NULL,
	`represented_by` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_meeting_participants`("id", "meeting_id", "owner_name", "unit_number", "shares", "attendance_status", "represented_by", "notes", "created_at", "updated_at") SELECT "id", "meeting_id", "owner_name", "unit_number", "shares", "attendance_status", "represented_by", "notes", "created_at", "updated_at" FROM `meeting_participants`;--> statement-breakpoint
DROP TABLE `meeting_participants`;--> statement-breakpoint
ALTER TABLE `__new_meeting_participants` RENAME TO `meeting_participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;