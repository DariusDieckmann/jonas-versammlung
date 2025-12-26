"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import conductRoutes from "./conduct.route";
import { MajorityType, agendaItems } from "./schemas/agenda-item.schema";
import { meetings } from "./schemas/meeting.schema";
import { meetingParticipants } from "./schemas/meeting-participant.schema";
import { ResolutionResult, resolutions } from "./schemas/resolution.schema";
import {
    insertVoteSchema,
    type Vote,
    VoteChoice,
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
 * Cast or update multiple votes in a batch (optimized to avoid N+1)
 */
export async function castVotesBatch(
    resolutionId: number,
    votesData: Array<{ participantId: number; voteChoice: VoteChoice }>,
): Promise<{ success: boolean; error?: string }> {
    try {
        // Early return if no votes to cast
        if (votesData.length === 0) {
            return { success: true };
        }

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

        // Get all existing votes for this resolution in one query
        const participantIds = votesData.map((v) => v.participantId);
        const existingVotes = await db
            .select()
            .from(votes)
            .where(
                and(
                    eq(votes.resolutionId, resolutionId),
                    inArray(votes.participantId, participantIds),
                ),
            );

        const existingVotesMap = new Map(
            existingVotes.map((v) => [v.participantId, v]),
        );

        // Prepare updates and inserts
        const updates: Array<{ id: number; vote: VoteChoice }> = [];
        const inserts: Array<{
            resolutionId: number;
            participantId: number;
            vote: VoteChoice;
        }> = [];

        for (const { participantId, voteChoice } of votesData) {
            const existingVote = existingVotesMap.get(participantId);
            if (existingVote) {
                updates.push({ id: existingVote.id, vote: voteChoice });
            } else {
                inserts.push({
                    resolutionId,
                    participantId,
                    vote: voteChoice,
                });
            }
        }

        // Execute updates in parallel and inserts in batch
        const updatePromises = updates.map((update) =>
            db
                .update(votes)
                .set({ vote: update.vote })
                .where(eq(votes.id, update.id))
        );

        const insertPromise = inserts.length > 0 
            ? db.insert(votes).values(inserts)
            : Promise.resolve();

        await Promise.all([...updatePromises, insertPromise]);

        revalidatePath(conductRoutes.agendaItems(resolution[0].meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error casting votes batch:", error);
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

        // Get resolution with agenda item to access majorityType
        const resolution = await db
            .select({
                resolution: resolutions,
                agendaItem: agendaItems,
            })
            .from(resolutions)
            .innerJoin(agendaItems, eq(resolutions.agendaItemId, agendaItems.id))
            .where(eq(resolutions.id, resolutionId))
            .limit(1);

        if (!resolution.length) {
            return { success: false, error: "Beschluss nicht gefunden" };
        }

        const majorityType = resolution[0].agendaItem.majorityType;

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
            if (v.vote === VoteChoice.YES) {
                votesYes++;
                yesShares += v.shares;
            } else if (v.vote === VoteChoice.NO) {
                votesNo++;
                noShares += v.shares;
            } else if (v.vote === VoteChoice.ABSTAIN) {
                votesAbstain++;
                abstainShares += v.shares;
            }
        }

        // Determine result based on majority type
        const totalShares = yesShares + noShares + abstainShares;
        let result: typeof ResolutionResult[keyof typeof ResolutionResult] = ResolutionResult.REJECTED;

        if (majorityType === MajorityType.SIMPLE) {
            // Simple majority: more yes than no (> 50%)
            result = yesShares > (totalShares * 0.5) ? ResolutionResult.ACCEPTED : ResolutionResult.REJECTED;
        } else if (majorityType === MajorityType.QUALIFIED) {
            // Qualified majority: 75% of votes
            result = yesShares > (totalShares * 0.75) ? ResolutionResult.ACCEPTED : ResolutionResult.REJECTED;
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
