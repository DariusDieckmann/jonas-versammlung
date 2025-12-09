import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { meetings } from "./meeting.schema";

/**
 * Meeting Participants - Snapshot of owners at the time of the meeting
 * This is a copy to preserve historical data even if owners change
 */
export const meetingParticipants = sqliteTable("meeting_participants", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    meetingId: integer("meeting_id")
        .notNull()
        .references(() => meetings.id, { onDelete: "cascade" }),

    // Copied owner data
    ownerName: text("owner_name").notNull(),
    unitNumber: text("unit_number").notNull(),
    shares: integer("shares").notNull(), // Miteigentumsanteile

    // Participation tracking
    attendanceStatus: text("attendance_status", {
        enum: ["present", "represented", "absent"],
    })
        .notNull()
        .default("absent"),
    representedBy: text("represented_by"), // Name des Vertreters bei "represented"
    notes: text("notes"), // Zusätzliche Notizen

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
});

// Zod schemas
export const insertMeetingParticipantSchema = createInsertSchema(
    meetingParticipants,
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateMeetingParticipantSchema =
    insertMeetingParticipantSchema.partial();

export const selectMeetingParticipantSchema =
    createSelectSchema(meetingParticipants);

// Types
export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type InsertMeetingParticipant = typeof meetingParticipants.$inferInsert;
export type UpdateMeetingParticipant = Partial<InsertMeetingParticipant>;
