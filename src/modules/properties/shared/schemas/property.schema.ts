import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "@/modules/organizations/shared/schemas/organization.schema";

export const properties = sqliteTable("properties", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    street: text("street").notNull(),
    houseNumber: text("house_number").notNull(),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    yearBuilt: integer("year_built"),
    numberOfUnits: integer("number_of_units"),
    totalArea: integer("total_area"), // in m²
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// Validation schemas
export const insertPropertySchema = createInsertSchema(properties, {
    name: z
        .string()
        .min(2, "Name muss mindestens 2 Zeichen lang sein")
        .max(200, "Name darf maximal 200 Zeichen lang sein"),
    street: z
        .string()
        .min(2, "Straße muss mindestens 2 Zeichen lang sein")
        .max(200, "Straße darf maximal 200 Zeichen lang sein"),
    houseNumber: z
        .string()
        .min(1, "Hausnummer ist erforderlich")
        .max(10, "Hausnummer darf maximal 10 Zeichen lang sein"),
    postalCode: z
        .string()
        .min(5, "PLZ muss mindestens 5 Zeichen lang sein")
        .max(10, "PLZ darf maximal 10 Zeichen lang sein"),
    city: z
        .string()
        .min(2, "Ort muss mindestens 2 Zeichen lang sein")
        .max(100, "Ort darf maximal 100 Zeichen lang sein"),
    yearBuilt: z
        .number()
        .int()
        .min(1800, "Baujahr muss nach 1800 liegen")
        .max(new Date().getFullYear() + 5, "Baujahr liegt zu weit in der Zukunft")
        .optional()
        .nullable(),
    numberOfUnits: z
        .number()
        .int()
        .min(1, "Mindestens 1 Einheit erforderlich")
        .optional()
        .nullable(),
    totalArea: z
        .number()
        .int()
        .min(1, "Fläche muss größer als 0 sein")
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

export const selectPropertySchema = createSelectSchema(properties);

export const updatePropertySchema = insertPropertySchema.partial();

// Types
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
