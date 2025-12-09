import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { meetingParticipants } from "./meeting-participant.schema";
import { resolutions } from "./resolution.schema";

export const votes = sqliteTable("votes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    resolutionId: integer("resolution_id")
        .notNull()
        .references(() => resolutions.id, { onDelete: "cascade" }),
    participantId: integer("participant_id")
        .notNull()
        .references(() => meetingParticipants.id, { onDelete: "cascade" }),
    vote: text("vote", { enum: ["yes", "no", "abstain"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
});

// Validation schemas
export const insertVoteSchema = createInsertSchema(votes, {
    vote: z.enum(["yes", "no", "abstain"]),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const selectVoteSchema = createSelectSchema(votes);

export const updateVoteSchema = insertVoteSchema.partial();

// Types
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type UpdateVote = z.infer<typeof updateVoteSchema>;
export type VoteChoice = "yes" | "no" | "abstain";
