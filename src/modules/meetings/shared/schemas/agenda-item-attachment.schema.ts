import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { agendaItems } from "./agenda-item.schema";

export const agendaItemAttachments = sqliteTable("agenda_item_attachments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    agendaItemId: integer("agenda_item_id")
        .notNull()
        .references(() => agendaItems.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(), // in bytes
    fileType: text("file_type").notNull(), // MIME type
    r2Key: text("r2_key").notNull(), // Key in R2 bucket
    r2Url: text("r2_url").notNull(), // Public URL
    uploadedBy: text("uploaded_by").notNull(), // User ID who uploaded
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
});

// Validation schemas
export const insertAgendaItemAttachmentSchema = createInsertSchema(
    agendaItemAttachments,
    {
        fileName: z.string().min(1, "Dateiname ist erforderlich"),
        fileSize: z.number().positive("Dateigröße muss positiv sein"),
        fileType: z.string().min(1, "Dateityp ist erforderlich"),
        r2Key: z.string().min(1, "R2 Key ist erforderlich"),
        r2Url: z.string().url("Ungültige URL"),
        uploadedBy: z.string().min(1, "Uploader ist erforderlich"),
    },
).omit({
    id: true,
    createdAt: true,
});

export const selectAgendaItemAttachmentSchema = createSelectSchema(
    agendaItemAttachments,
);

// Types
export type AgendaItemAttachment = typeof agendaItemAttachments.$inferSelect;
export type NewAgendaItemAttachment = typeof agendaItemAttachments.$inferInsert;
export type InsertAgendaItemAttachment = z.infer<
    typeof insertAgendaItemAttachmentSchema
>;
