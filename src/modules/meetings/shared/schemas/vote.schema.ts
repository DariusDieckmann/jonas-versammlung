import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

// Enums
export const VoteChoice = {
    YES: "yes",
    NO: "no",
    ABSTAIN: "abstain",
} as const;

// Validation schemas
export const voteChoiceSchema = z.enum(["yes", "no", "abstain"]);

// Types
export type Vote = typeof votes.$inferSelect;
export type VoteChoiceType = typeof VoteChoice[keyof typeof VoteChoice];
