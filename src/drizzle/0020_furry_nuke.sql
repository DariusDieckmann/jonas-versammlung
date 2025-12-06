CREATE TABLE `organization_invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` integer NOT NULL,
	`email` text NOT NULL,
	`invitation_code` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`invited_by` text NOT NULL,
	`invited_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`accepted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitations_invitation_code_unique` ON `organization_invitations` (`invitation_code`);