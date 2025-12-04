import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organization.schema";

/**
 * Organization invitations table
 * Stores pending invitations with time-limited tokens
 */
export const organizationInvitations = sqliteTable(
    "organization_invitations",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        organizationId: integer("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        invitationCode: text("invitation_code").notNull().unique(),
        role: text("role").notNull().default("member"), // 'owner' | 'member'
        invitedBy: text("invited_by").notNull(), // userId who sent the invitation
        invitedAt: text("invited_at").notNull(),
        expiresAt: text("expires_at").notNull(),
        acceptedAt: text("accepted_at"), // null if not yet accepted
    },
);

// Zod schemas for validation
export const insertOrganizationInvitationSchema = createInsertSchema(
    organizationInvitations,
    {
        email: z.string().email("Ungültige E-Mail-Adresse"),
        role: z.enum(["owner", "member"]),
    },
);

export const selectOrganizationInvitationSchema = createSelectSchema(
    organizationInvitations,
);

// Types
export type OrganizationInvitation = z.infer<
    typeof selectOrganizationInvitationSchema
>;
export type NewOrganizationInvitation = z.infer<
    typeof insertOrganizationInvitationSchema
>;
