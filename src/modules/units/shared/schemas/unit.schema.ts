import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "@/modules/organizations/shared/schemas/organization.schema";
import { properties } from "@/modules/properties/shared/schemas/property.schema";

export const units = sqliteTable("units", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    propertyId: integer("property_id")
        .notNull()
        .references(() => properties.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    floor: integer("floor"),
    area: real("area"),
    ownershipShares: integer("ownership_shares").notNull(),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
}, (table) => ({
    // Index for property-based unit lookups
    propertyIdx: index("idx_units_property").on(table.propertyId),
    // Index for organization-based queries
    orgIdx: index("idx_units_org").on(table.organizationId),
    // Composite index for security checks
    propertyOrgIdx: index("idx_units_property_org").on(table.propertyId, table.organizationId),
}));

// Validation schemas
export const insertUnitSchema = createInsertSchema(units, {
    name: z
        .string()
        .min(1, "Einheit muss mindestens 1 Zeichen lang sein")
        .max(100, "Einheit darf maximal 100 Zeichen lang sein"),
    floor: z
        .number()
        .int("Etage muss eine Ganzzahl sein")
        .optional()
        .nullable(),
    area: z
        .number()
        .min(0, "Fläche muss größer oder gleich 0 sein")
        .optional()
        .nullable(),
    ownershipShares: z
        .number()
        .int("Miteigentumsanteile müssen eine Ganzzahl sein")
        .min(1, "Mindestens 1 Anteil erforderlich"),
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

export const updateUnitSchema = insertUnitSchema
    .partial()
    .omit({ propertyId: true });

export const selectUnitSchema = createSelectSchema(units);

// Types
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type UpdateUnit = z.infer<typeof updateUnitSchema>;
