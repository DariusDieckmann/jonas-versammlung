import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "@/modules/organizations/shared/schemas/organization.schema";
import { units } from "@/modules/units/shared/schemas/unit.schema";

export const owners = sqliteTable("owners", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    unitId: integer("unit_id")
        .notNull()
        .references(() => units.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    notes: text("notes"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

// Validation schemas
export const insertOwnerSchema = createInsertSchema(owners, {
    firstName: z
        .string()
        .min(2, "Vorname muss mindestens 2 Zeichen lang sein")
        .max(100, "Vorname darf maximal 100 Zeichen lang sein"),
    lastName: z
        .string()
        .min(2, "Nachname muss mindestens 2 Zeichen lang sein")
        .max(100, "Nachname darf maximal 100 Zeichen lang sein"),
    email: z
        .string()
        .email("Ungültige E-Mail-Adresse")
        .max(200, "E-Mail darf maximal 200 Zeichen lang sein")
        .optional()
        .nullable(),
    phone: z
        .string()
        .max(50, "Telefonnummer darf maximal 50 Zeichen lang sein")
        .optional()
        .nullable(),
    notes: z
        .string()
        .max(2000, "Notizen dürfen maximal 2000 Zeichen lang sein")
        .optional()
        .nullable(),
}).omit({
    id: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
});

export const updateOwnerSchema = insertOwnerSchema
    .partial()
    .omit({ unitId: true });

export const selectOwnerSchema = createSelectSchema(owners);

// Types
export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;
export type InsertOwner = z.infer<typeof insertOwnerSchema>;
export type UpdateOwner = z.infer<typeof updateOwnerSchema>;
