import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { agendaItems } from "./agenda-item.schema";

export const resolutions = sqliteTable("resolutions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    agendaItemId: integer("agenda_item_id")
        .notNull()
        .references(() => agendaItems.id, { onDelete: "cascade" }),
    result: text("result", { enum: ["accepted", "rejected", "postponed"] }),
    votesYes: integer("votes_yes").notNull().default(0),
    votesNo: integer("votes_no").notNull().default(0),
    votesAbstain: integer("votes_abstain").notNull().default(0),
    yesShares: text("yes_shares"), // Stored as string for decimal precision
    noShares: text("no_shares"),
    abstainShares: text("abstain_shares"),
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
});

// Validation schemas
export const insertResolutionSchema = createInsertSchema(resolutions, {
    result: z.enum(["accepted", "rejected", "postponed"]).optional().nullable(),
    votesYes: z.number().int().min(0, "Stimmen müssen positiv sein").default(0),
    votesNo: z.number().int().min(0, "Stimmen müssen positiv sein").default(0),
    votesAbstain: z
        .number()
        .int()
        .min(0, "Stimmen müssen positiv sein")
        .default(0),
    yesShares: z.string().optional().nullable(),
    noShares: z.string().optional().nullable(),
    abstainShares: z.string().optional().nullable(),
    comment: z
        .string()
        .max(2000, "Kommentar darf maximal 2000 Zeichen lang sein")
        .optional()
        .nullable(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const selectResolutionSchema = createSelectSchema(resolutions);

export const updateResolutionSchema = insertResolutionSchema.partial();

// Enums
export const ResolutionResult = {
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    POSTPONED: "postponed",
} as const;

// Types
export type Resolution = typeof resolutions.$inferSelect;
export type NewResolution = typeof resolutions.$inferInsert;
export type InsertResolution = z.infer<typeof insertResolutionSchema>;
export type UpdateResolution = z.infer<typeof updateResolutionSchema>;
export type ResolutionResultType = typeof ResolutionResult[keyof typeof ResolutionResult];
