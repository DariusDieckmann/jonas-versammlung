"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import conductRoutes from "./conduct.route";
import { agendaItems } from "./schemas/agenda-item.schema";
import { meetings } from "./schemas/meeting.schema";
import { meetingParticipants } from "./schemas/meeting-participant.schema";
import { resolutions } from "./schemas/resolution.schema";
import {
    insertVoteSchema,
    type Vote,
    type VoteChoice,
    votes,
} from "./schemas/vote.schema";

/**
 * Get all votes for a resolution
 */
export async function getVotes(
    resolutionId: number,
): Promise<(Vote & { participantName: string; shares: number })[]> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select({
            vote: votes,
            participantName: meetingParticipants.ownerName,
            shares: meetingParticipants.shares,
        })
        .from(votes)
        .innerJoin(
            meetingParticipants,
            eq(votes.participantId, meetingParticipants.id),
        )
        .where(eq(votes.resolutionId, resolutionId));

    return result.map((r) => ({
        ...r.vote,
        participantName: r.participantName,
        shares: r.shares,
    }));
}

/**
 * Cast or update a vote
 */
export async function castVote(
    resolutionId: number,
    participantId: number,
    voteChoice: VoteChoice,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check access - get meeting through resolution -> agendaItem -> meeting
        const resolution = await db
            .select({
                resolution: resolutions,
                property: properties,
                meetingId: meetings.id,
            })
            .from(resolutions)
            .innerJoin(
                agendaItems,
                eq(resolutions.agendaItemId, agendaItems.id),
            )
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(resolutions.id, resolutionId))
            .limit(1);

        if (!resolution.length) {
            return { success: false, error: "Beschluss nicht gefunden" };
        }

        await requireMember(resolution[0].property.organizationId);

        const now = new Date().toISOString();

        // Check if vote exists
        const existingVote = await db
            .select()
            .from(votes)
            .where(
                and(
                    eq(votes.resolutionId, resolutionId),
                    eq(votes.participantId, participantId),
                ),
            )
            .limit(1);

        if (existingVote.length > 0) {
            // Update existing vote
            await db
                .update(votes)
                .set({
                    vote: voteChoice,
                })
                .where(eq(votes.id, existingVote[0].id));
        } else {
            // Create new vote
            const validatedData = insertVoteSchema.parse({
                resolutionId,
                participantId,
                vote: voteChoice,
            });

            await db.insert(votes).values(validatedData);
        }

        revalidatePath(conductRoutes.agendaItems(resolution[0].meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error casting vote:", error);
        return {
            success: false,
            error: "Fehler beim Abstimmen",
        };
    }
}

/**
 * Calculate resolution result based on votes
 */
export async function calculateResolutionResult(
    resolutionId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get resolution with votes
        const resolution = await db
            .select()
            .from(resolutions)
            .where(eq(resolutions.id, resolutionId))
            .limit(1);

        if (!resolution.length) {
            return { success: false, error: "Beschluss nicht gefunden" };
        }

        // Get all votes with participant shares
        const votesWithShares = await db
            .select({
                vote: votes.vote,
                shares: meetingParticipants.shares,
            })
            .from(votes)
            .innerJoin(
                meetingParticipants,
                eq(votes.participantId, meetingParticipants.id),
            )
            .where(eq(votes.resolutionId, resolutionId));

        let votesYes = 0;
        let votesNo = 0;
        let votesAbstain = 0;
        let yesShares = 0;
        let noShares = 0;
        let abstainShares = 0;

        for (const v of votesWithShares) {
            if (v.vote === "yes") {
                votesYes++;
                yesShares += v.shares;
            } else if (v.vote === "no") {
                votesNo++;
                noShares += v.shares;
            } else if (v.vote === "abstain") {
                votesAbstain++;
                abstainShares += v.shares;
            }
        }

        // Determine result based on majority type
        const totalShares = yesShares + noShares + abstainShares;
        let result: "accepted" | "rejected" | "postponed" = "rejected";

        if (resolution[0].majorityType === "simple") {
            // Simple majority: more yes than no
            result = yesShares > noShares ? "accepted" : "rejected";
        } else if (resolution[0].majorityType === "qualified") {
            // Qualified majority: 2/3 of votes
            result =
                yesShares >= (totalShares * 2) / 3 ? "accepted" : "rejected";
        } else if (resolution[0].majorityType === "unanimous") {
            // Unanimous: all votes yes
            result = votesNo === 0 && votesYes > 0 ? "accepted" : "rejected";
        }

        // Update resolution
        await db
            .update(resolutions)
            .set({
                votesYes,
                votesNo,
                votesAbstain,
                yesShares: yesShares.toString(),
                noShares: noShares.toString(),
                abstainShares: abstainShares.toString(),
                result,
            })
            .where(eq(resolutions.id, resolutionId));

        return { success: true };
    } catch (error) {
        console.error("Error calculating resolution result:", error);
        return {
            success: false,
            error: "Fehler beim Berechnen des Ergebnisses",
        };
    }
}
