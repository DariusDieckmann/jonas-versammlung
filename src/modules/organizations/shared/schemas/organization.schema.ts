import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "@/modules/auth/shared/schemas/auth.schema";

export const organizations = sqliteTable("organizations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const organizationMembers = sqliteTable("organization_members", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // 'owner' or 'member'
    joinedAt: text("joined_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

// Zod schemas for validation
export const insertOrganizationSchema = createInsertSchema(organizations, {
    name: z
        .string()
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must be at most 100 characters"),
    createdBy: z.string().min(1, "Creator ID is required"),
});

export const selectOrganizationSchema = createSelectSchema(organizations);

export const updateOrganizationSchema = insertOrganizationSchema
    .partial()
    .omit({
        id: true,
        createdBy: true,
        createdAt: true,
    });

export const insertOrganizationMemberSchema = createInsertSchema(
    organizationMembers,
    {
        organizationId: z.number().positive("Organization ID is required"),
        userId: z.string().min(1, "User ID is required"),
        role: z.enum(["owner", "member"]).default("member"),
    },
);

export const selectOrganizationMemberSchema =
    createSelectSchema(organizationMembers);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
