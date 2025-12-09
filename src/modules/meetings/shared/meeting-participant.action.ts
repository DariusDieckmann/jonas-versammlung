"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { owners } from "@/modules/owners/shared/schemas/owner.schema";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import { units } from "@/modules/units/shared/schemas/unit.schema";
import meetingsRoutes from "./meetings.route";
import { meetings } from "./schemas/meeting.schema";
import {
    insertMeetingParticipantSchema,
    type MeetingParticipant,
    meetingParticipants,
    type UpdateMeetingParticipant,
    updateMeetingParticipantSchema,
} from "./schemas/meeting-participant.schema";

/**
 * Get all participants for a meeting
 */
export async function getMeetingParticipants(
    meetingId: number,
): Promise<MeetingParticipant[]> {
    await requireAuth();
    const db = await getDb();

    // Check access
    const meeting = await db
        .select({ property: properties })
        .from(meetings)
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(eq(meetings.id, meetingId))
        .limit(1);

    if (!meeting.length) {
        throw new Error("Versammlung nicht gefunden");
    }

    await requireMember(meeting[0].property.organizationId);

    const result = await db
        .select()
        .from(meetingParticipants)
        .where(eq(meetingParticipants.meetingId, meetingId));

    return result;
}

/**
 * Create participant snapshot from current owners
 */
export async function createParticipantsFromOwners(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property
        const meeting = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!meeting.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(meeting[0].property.organizationId);

        const propertyId = meeting[0].meeting.propertyId;

        // Check if participants already exist
        const existingParticipants = await db
            .select()
            .from(meetingParticipants)
            .where(eq(meetingParticipants.meetingId, meetingId));

        if (existingParticipants.length > 0) {
            return {
                success: false,
                error: "Teilnehmer wurden bereits erstellt",
            };
        }

        // First: Get all units for this property
        const propertyUnits = await db
            .select()
            .from(units)
            .where(eq(units.propertyId, propertyId));

        if (propertyUnits.length === 0) {
            return {
                success: false,
                error: "Keine Einheiten für diese Liegenschaft gefunden",
            };
        }

        // Second: Get all owners for these units
        const unitIds = propertyUnits.map((u) => u.id);
        const allOwners = await db
            .select({
                owner: owners,
                unit: units,
            })
            .from(owners)
            .innerJoin(units, eq(owners.unitId, units.id))
            .where(inArray(owners.unitId, unitIds));

        if (allOwners.length === 0) {
            return {
                success: false,
                error: "Keine Eigentümer für diese Liegenschaft gefunden",
            };
        }

        // Create snapshot of participants
        for (const { owner, unit } of allOwners) {
            const participantData = {
                meetingId,
                ownerName: `${owner.firstName} ${owner.lastName}`,
                unitNumber: unit.name, // Unit name as identifier
                shares: unit.ownershipShares, // Shares from the unit
                attendanceStatus: "absent" as const,
                representedBy: null,
                notes: null,
            };

            const validatedData =
                insertMeetingParticipantSchema.parse(participantData);

            await db.insert(meetingParticipants).values(validatedData);
        }

        // Don't revalidate here as this is called during render
        // The page component will fetch the newly created participants immediately after
        return { success: true };
    } catch (error) {
        console.error("Error creating participants:", error);
        return {
            success: false,
            error: "Fehler beim Erstellen der Teilnehmerliste",
        };
    }
}

/**
 * Update participant presence/representation
 */
export async function updateMeetingParticipant(
    participantId: number,
    data: UpdateMeetingParticipant,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check access
        const participant = await db
            .select({
                participant: meetingParticipants,
                property: properties,
            })
            .from(meetingParticipants)
            .innerJoin(meetings, eq(meetingParticipants.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetingParticipants.id, participantId))
            .limit(1);

        if (!participant.length) {
            return { success: false, error: "Teilnehmer nicht gefunden" };
        }

        await requireMember(participant[0].property.organizationId);

        const validatedData = updateMeetingParticipantSchema.parse(data);

        await db
            .update(meetingParticipants)
            .set(validatedData)
            .where(eq(meetingParticipants.id, participantId));

        revalidatePath(
            meetingsRoutes.detail(participant[0].participant.meetingId),
        );
        return { success: true };
    } catch (error) {
        console.error("Error updating participant:", error);
        return {
            success: false,
            error: "Fehler beim Aktualisieren des Teilnehmers",
        };
    }
}
