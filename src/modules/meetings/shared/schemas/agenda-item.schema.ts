import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { meetings } from "./meeting.schema";

export const agendaItems = sqliteTable("agenda_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    meetingId: integer("meeting_id")
        .notNull()
        .references(() => meetings.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    requiresResolution: integer("requires_resolution", { mode: "boolean" })
        .notNull()
        .default(false),
    majorityType: text("majority_type", {
        enum: ["simple", "qualified"],
    }), // simple = 50%, qualified = 75%
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
}, (table) => ({
    // Index for meeting-based agenda item lookups
    meetingIdx: index("idx_agenda_items_meeting").on(table.meetingId),
    // Index for order-based sorting
    orderIdx: index("idx_agenda_items_order").on(table.orderIndex),
    // Composite index for ordered retrieval by meeting
    meetingOrderIdx: index("idx_agenda_items_meeting_order").on(table.meetingId, table.orderIndex),
}));

// Validation schemas
export const insertAgendaItemSchema = createInsertSchema(agendaItems, {
    title: z
        .string()
        .min(2, "Titel muss mindestens 2 Zeichen lang sein")
        .max(500, "Titel darf maximal 500 Zeichen lang sein"),
    description: z
        .string()
        .max(5000, "Beschreibung darf maximal 5000 Zeichen lang sein")
        .optional()
        .nullable(),
    orderIndex: z.number().int().min(0, "Reihenfolge muss positiv sein"),
    requiresResolution: z.boolean().default(false),
    majorityType: z.enum(["simple", "qualified"]).optional().nullable(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const selectAgendaItemSchema = createSelectSchema(agendaItems);

export const updateAgendaItemSchema = insertAgendaItemSchema.partial();

// Types
export type AgendaItem = typeof agendaItems.$inferSelect;
export type NewAgendaItem = typeof agendaItems.$inferInsert;
export type InsertAgendaItem = z.infer<typeof insertAgendaItemSchema>;
export type UpdateAgendaItem = z.infer<typeof updateAgendaItemSchema>;
