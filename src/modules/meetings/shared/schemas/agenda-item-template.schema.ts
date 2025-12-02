import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "@/modules/organizations/shared/schemas/organization.schema";

export const agendaItemTemplates = sqliteTable("agenda_item_templates", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    requiresResolution: integer("requires_resolution", { mode: "boolean" })
        .notNull()
        .default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// Validation schemas
export const insertAgendaItemTemplateSchema = createInsertSchema(
    agendaItemTemplates,
    {
        title: z
            .string()
            .min(2, "Titel muss mindestens 2 Zeichen lang sein")
            .max(500, "Titel darf maximal 500 Zeichen lang sein"),
        description: z
            .string()
            .max(5000, "Beschreibung darf maximal 5000 Zeichen lang sein")
            .optional()
            .nullable(),
        requiresResolution: z.boolean().default(false),
    },
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const selectAgendaItemTemplateSchema = createSelectSchema(
    agendaItemTemplates,
);

export const updateAgendaItemTemplateSchema =
    insertAgendaItemTemplateSchema.partial();

// Types
export type AgendaItemTemplate = typeof agendaItemTemplates.$inferSelect;
export type NewAgendaItemTemplate = typeof agendaItemTemplates.$inferInsert;
export type InsertAgendaItemTemplate = z.infer<
    typeof insertAgendaItemTemplateSchema
>;
export type UpdateAgendaItemTemplate = z.infer<
    typeof updateAgendaItemTemplateSchema
>;
