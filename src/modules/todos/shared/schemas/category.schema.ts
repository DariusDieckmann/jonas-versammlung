import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { VALIDATION_MESSAGES } from "../constants/validation.constant";
import { organizations } from "@/modules/organizations/shared/schemas/organization.schema";

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    color: text("color").default("#6366f1"),
    description: text("description"),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const insertCategorySchema = createInsertSchema(categories, {
    name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
    color: z.string().optional(),
    description: z.string().optional(),
    organizationId: z.number().positive("Organization ID is required"),
});

export const selectCategorySchema = createSelectSchema(categories);

export const updateCategorySchema = insertCategorySchema.partial().omit({
    id: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
