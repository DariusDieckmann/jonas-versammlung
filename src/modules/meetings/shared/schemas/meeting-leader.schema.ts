import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { meetings } from "./meeting.schema";

/**
 * Meeting Leaders - Stores the leaders/chairpersons of a meeting
 */
export const meetingLeaders = sqliteTable("meeting_leaders", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    meetingId: integer("meeting_id")
        .notNull()
        .references(() => meetings.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role"), // z.B. "Versammlungsleiter", "Protokollführer", "Stimmzähler"
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// Zod schemas
export const insertMeetingLeaderSchema = createInsertSchema(meetingLeaders).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateMeetingLeaderSchema = insertMeetingLeaderSchema.partial();

export const selectMeetingLeaderSchema = createSelectSchema(meetingLeaders);

// Types
export type MeetingLeader = typeof meetingLeaders.$inferSelect;
export type InsertMeetingLeader = typeof meetingLeaders.$inferInsert;
export type UpdateMeetingLeader = Partial<InsertMeetingLeader>;
