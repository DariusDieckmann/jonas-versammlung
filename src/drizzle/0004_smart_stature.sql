CREATE INDEX `idx_agenda_items_meeting` ON `agenda_items` (`meeting_id`);--> statement-breakpoint
CREATE INDEX `idx_agenda_items_order` ON `agenda_items` (`order_index`);--> statement-breakpoint
CREATE INDEX `idx_agenda_items_meeting_order` ON `agenda_items` (`meeting_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `idx_meeting_participants_meeting` ON `meeting_participants` (`meeting_id`);--> statement-breakpoint
CREATE INDEX `idx_meetings_property` ON `meetings` (`property_id`);--> statement-breakpoint
CREATE INDEX `idx_meetings_status` ON `meetings` (`status`);--> statement-breakpoint
CREATE INDEX `idx_meetings_date` ON `meetings` (`date`);--> statement-breakpoint
CREATE INDEX `idx_meetings_status_date` ON `meetings` (`status`,`date`);--> statement-breakpoint
CREATE INDEX `idx_org_members_user_org` ON `organization_members` (`user_id`,`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_org_members_org` ON `organization_members` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_org_members_role` ON `organization_members` (`role`);--> statement-breakpoint
CREATE INDEX `idx_owners_unit` ON `owners` (`unit_id`);--> statement-breakpoint
CREATE INDEX `idx_owners_org` ON `owners` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_properties_org` ON `properties` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_units_property` ON `units` (`property_id`);--> statement-breakpoint
CREATE INDEX `idx_units_org` ON `units` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_units_property_org` ON `units` (`property_id`,`organization_id`);