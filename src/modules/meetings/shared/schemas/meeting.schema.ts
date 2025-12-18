import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { properties } from "@/modules/properties/shared/schemas/property.schema";

export const meetings = sqliteTable("meetings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    propertyId: integer("property_id")
        .notNull()
        .references(() => properties.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
    startTime: text("start_time").notNull(), // ISO time string (HH:MM)
    endTime: text("end_time"), // ISO time string (HH:MM)
    locationName: text("location_name").notNull(),
    locationAddress: text("location_address"),
    invitationDeadline: text("invitation_deadline").notNull(), // ISO datetime string
    status: text("status", { enum: ["planned", "in-progress", "completed"] })
        .notNull()
        .default("planned"),
    // Conduct progress tracking
    leadersConfirmedAt: integer("leaders_confirmed_at", { mode: "timestamp" }),
    participantsConfirmedAt: integer("participants_confirmed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
}, (table) => ({
    // Index for property-based meeting lookups
    propertyIdx: index("idx_meetings_property").on(table.propertyId),
    // Index for status filtering
    statusIdx: index("idx_meetings_status").on(table.status),
    // Index for date-based queries
    dateIdx: index("idx_meetings_date").on(table.date),
    // Composite index for upcoming open meetings query
    statusDateIdx: index("idx_meetings_status_date").on(table.status, table.date),
}));

// Validation schemas
export const insertMeetingSchema = createInsertSchema(meetings, {
    title: z
        .string()
        .min(3, "Titel muss mindestens 3 Zeichen lang sein")
        .max(200, "Titel darf maximal 200 Zeichen lang sein"),
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format YYYY-MM-DD sein"),
    startTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Startzeit muss im Format HH:MM sein"),
    endTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Endzeit muss im Format HH:MM sein")
        .optional()
        .nullable(),
    locationName: z
        .string()
        .min(2, "Ortsname muss mindestens 2 Zeichen lang sein")
        .max(200, "Ortsname darf maximal 200 Zeichen lang sein"),
    locationAddress: z
        .string()
        .max(500, "Adresse darf maximal 500 Zeichen lang sein")
        .optional()
        .nullable(),
    invitationDeadline: z.string().min(1, "Einladungsfrist ist erforderlich"),
    status: z.enum(["planned", "in-progress", "completed"]),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const selectMeetingSchema = createSelectSchema(meetings);

export const updateMeetingSchema = insertMeetingSchema.partial();

// Types
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type UpdateMeeting = z.infer<typeof updateMeetingSchema>;
export type MeetingStatus = "planned" | "in-progress" | "completed";
