"use server";

import { and, eq, gte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, meetingParticipants } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    getUserOrganizationIds,
    requireMember,
    requireOwner,
} from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import meetingsRoutes from "./meetings.route";
import {
    type InsertMeeting,
    insertMeetingSchema,
    type Meeting,
    MeetingStatus,
    meetings,
    type UpdateMeeting,
    updateMeetingSchema,
} from "./schemas/meeting.schema";
import { createParticipantsFromOwners } from "./meeting-participant.action";

/**
 * Get all meetings for the user's properties
 * Only returns meetings from organizations where the user is a member
 */
export async function getMeetings(): Promise<Meeting[]> {
    await requireAuth();
    const db = await getDb();

    // Get all organization IDs the user is a member of (1 query)
    const userOrgIds = await getUserOrganizationIds();

    if (userOrgIds.length === 0) {
        return [];
    }

    // Get all meetings from properties in user's organizations (1 query)
    const result = await db
        .select({
            meeting: meetings,
        })
        .from(meetings)
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(inArray(properties.organizationId, userOrgIds))
        .orderBy(meetings.date);

    return result.map((r) => r.meeting);
}

/**
 * Get meetings for a specific property
 */
export async function getMeetingsByProperty(
    propertyId: number,
): Promise<Meeting[]> {
    await requireAuth();
    const db = await getDb();

    // Get meetings with property in one query to check access and retrieve data
    const result = await db
        .select({
            meeting: meetings,
            property: properties,
        })
        .from(meetings)
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(eq(meetings.propertyId, propertyId))
        .orderBy(meetings.date);

    if (result.length === 0) {
        // Check if property exists
        const property = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId))
            .limit(1);

        if (!property.length) {
            throw new Error("Liegenschaft nicht gefunden");
        }

        await requireMember(property[0].organizationId);
        return [];
    }

    // Check access using the first result
    await requireMember(result[0].property.organizationId);

    return result.map((r) => r.meeting);
}

/**
 * Get a single meeting by ID
 * @param includeProperty If true, also returns the property data (avoids extra query)
 */
export async function getMeeting(meetingId: number): Promise<Meeting | null>;
export async function getMeeting(
    meetingId: number,
    includeProperty: true,
): Promise<{ meeting: Meeting; property: typeof properties.$inferSelect } | null>;
export async function getMeeting(
    meetingId: number,
    includeProperty?: boolean,
): Promise<Meeting | { meeting: Meeting; property: typeof properties.$inferSelect } | null> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select({
            meeting: meetings,
            property: properties,
        })
        .from(meetings)
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(eq(meetings.id, meetingId))
        .limit(1);

    if (!result.length) {
        return null;
    }

    await requireMember(result[0].property.organizationId);

    if (includeProperty) {
        return result[0];
    }

    return result[0].meeting;
}

/**
 * Create a new meeting
 */
export async function createMeeting(
    data: InsertMeeting,
): Promise<{ success: boolean; error?: string; meetingId?: number }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check property access
        const property = await db
            .select()
            .from(properties)
            .where(eq(properties.id, data.propertyId))
            .limit(1);

        if (!property.length) {
            return {
                success: false,
                error: "Liegenschaft nicht gefunden",
            };
        }

        await requireMember(property[0].organizationId);

        const validatedData = insertMeetingSchema.parse(data);

        const result = await db
            .insert(meetings)
            .values(validatedData)
            .returning();

        revalidatePath(meetingsRoutes.list);
        return { success: true, meetingId: result[0].id };
    } catch (error) {
        console.error("Error creating meeting:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Erstellen der Versammlung",
        };
    }
}

/**
 * Update a meeting
 */
export async function updateMeeting(
    meetingId: number,
    data: UpdateMeeting,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property to check organization
        const existing = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(existing[0].property.organizationId);

        const validatedData = updateMeetingSchema.parse(data);

        // Remove undefined values to prevent overwriting existing fields with NULL
        const updateData = Object.fromEntries(
            Object.entries(validatedData).filter(([_, value]) => value !== undefined)
        ) as Partial<typeof meetings.$inferInsert>;

        await db
            .update(meetings)
            .set(updateData)
            .where(eq(meetings.id, meetingId));

        revalidatePath(meetingsRoutes.list);
        revalidatePath(meetingsRoutes.detail(meetingId));

        return { success: true };
    } catch (error) {
        console.error("Error updating meeting:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren der Versammlung",
        };
    }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property to check organization
        const existing = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireOwner(existing[0].property.organizationId);

        await db.delete(meetings).where(eq(meetings.id, meetingId));

        revalidatePath(meetingsRoutes.list);
        return { success: true };
    } catch (error) {
        console.error("Error deleting meeting:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Löschen der Versammlung",
        };
    }
}

/**
 * Start a meeting - sets status to in-progress and creates participant snapshot
 */
export async function startMeeting(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property to check organization
        const existing = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(existing[0].property.organizationId);

        // Check if meeting is already in-progress or completed
        if (existing[0].meeting.status !== "planned") {
            return {
                success: false,
                error: "Versammlung wurde bereits gestartet",
            };
        }

        // Check if participants already exist
        const existingParticipants = await db
            .select()
            .from(meetingParticipants)
            .where(eq(meetingParticipants.meetingId, meetingId));

        // Only create participant snapshot if none exist yet
        if (existingParticipants.length === 0) {
            const participantResult = await createParticipantsFromOwners(meetingId);
            if (!participantResult.success) {
                return {
                    success: false,
                    error:
                        participantResult.error ||
                        "Fehler beim Erstellen der Teilnehmerliste",
                };
            }
        }

        await db
            .update(meetings)
            .set({
                status: "in-progress",
                leadersConfirmedAt: null,
                participantsConfirmedAt: null,
            })
            .where(eq(meetings.id, meetingId));

        revalidatePath(meetingsRoutes.detail(meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error starting meeting:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Starten der Versammlung",
        };
    }
}

/**
 * Complete a meeting - sets status to completed
 */
export async function completeMeeting(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property to check organization
        const existing = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(existing[0].property.organizationId);

        // Check if meeting is in-progress
        if (existing[0].meeting.status !== MeetingStatus.IN_PROGRESS) {
            return {
                success: false,
                error: "Versammlung muss im Status 'In Bearbeitung' sein",
            };
        }

        // Set end time to current time
        const now = new Date();
        const endTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        await db
            .update(meetings)
            .set({
                status: MeetingStatus.COMPLETED,
                endTime,
            })
            .where(eq(meetings.id, meetingId));

        revalidatePath(meetingsRoutes.detail(meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error completing meeting:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Abschließen der Versammlung",
        };
    }
}

/**
 * Get upcoming open meetings (status: planned, date in the future)
 * Only returns meetings from organizations where the user is a member
 */
export async function getUpcomingOpenMeetings(): Promise<
    (Meeting & { propertyName: string })[]
> {
    await requireAuth();
    const db = await getDb();

    // Get all organization IDs the user is a member of (1 query)
    const userOrgIds = await getUserOrganizationIds();

    if (userOrgIds.length === 0) {
        return [];
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Get all upcoming meetings from properties in user's organizations (1 query)
    const result = await db
        .select({
            meeting: meetings,
            property: properties,
        })
        .from(meetings)
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(
            and(
                eq(meetings.status, "planned"),
                gte(meetings.date, today),
                inArray(properties.organizationId, userOrgIds),
            ),
        )
        .orderBy(meetings.date);

    return result.map((r) => ({
        ...r.meeting,
        propertyName: r.property.name,
    }));
}

/**
 * Confirm leaders step - marks the leaders step as completed
 */
export async function confirmLeaders(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property to check organization
        const existing = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(existing[0].property.organizationId);

        await db
            .update(meetings)
            .set({
                leadersConfirmedAt: new Date(),
            })
            .where(eq(meetings.id, meetingId));

        return { success: true };
    } catch (error) {
        console.error("Error confirming leaders:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Bestätigen der Leiter",
        };
    }
}

/**
 * Confirm participants step - marks the participants step as completed
 */
export async function confirmParticipants(
    meetingId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get meeting with property to check organization
        const existing = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(existing[0].property.organizationId);

        await db
            .update(meetings)
            .set({
                participantsConfirmedAt: new Date(),
            })
            .where(eq(meetings.id, meetingId));

        return { success: true };
    } catch (error) {
        console.error("Error confirming participants:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Bestätigen der Teilnehmer",
        };
    }
}
