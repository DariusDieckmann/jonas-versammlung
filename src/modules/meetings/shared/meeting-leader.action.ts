"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import meetingsRoutes from "./meetings.route";
import { meetings } from "./schemas/meeting.schema";
import {
    insertMeetingLeaderSchema,
    type MeetingLeader,
    meetingLeaders,
} from "./schemas/meeting-leader.schema";

/**
 * Get all leaders for a meeting
 */
export async function getMeetingLeaders(
    meetingId: number,
): Promise<MeetingLeader[]> {
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
        .from(meetingLeaders)
        .where(eq(meetingLeaders.meetingId, meetingId));

    return result;
}

/**
 * Create meeting leaders in bulk
 */
export async function createMeetingLeaders(
    meetingId: number,
    leaders: Array<{ name: string; role?: string | null }>,
): Promise<{ success: boolean; error?: string }> {
    try {
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
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(meeting[0].property.organizationId);

        const now = new Date().toISOString();

        for (const leader of leaders) {
            const validatedData = insertMeetingLeaderSchema.parse({
                meetingId,
                ...leader,
            });

            await db.insert(meetingLeaders).values({
                ...validatedData,
                createdAt: now,
                updatedAt: now,
            });
        }

        revalidatePath(meetingsRoutes.detail(meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error creating meeting leaders:", error);
        return {
            success: false,
            error: "Fehler beim Speichern der Versammlungsleiter",
        };
    }
}

/**
 * Delete all leaders for a meeting (to replace them)
 */
export async function deleteMeetingLeaders(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
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
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(meeting[0].property.organizationId);

        await db
            .delete(meetingLeaders)
            .where(eq(meetingLeaders.meetingId, meetingId));

        revalidatePath(meetingsRoutes.detail(meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting meeting leaders:", error);
        return {
            success: false,
            error: "Fehler beim Löschen der Versammlungsleiter",
        };
    }
}
