"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    requireMember,
    requireOwner,
} from "@/modules/organizations/shared/organization-permissions.action";
import {
    insertMeetingSchema,
    meetings,
    updateMeetingSchema,
    type InsertMeeting,
    type Meeting,
    type UpdateMeeting,
} from "./schemas/meeting.schema";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import meetingsRoutes from "../meetings.route";

/**
 * Get all meetings for the user's properties
 */
export async function getMeetings(): Promise<Meeting[]> {
    await requireAuth();
    const db = await getDb();

    // Get all meetings with property info to check organization access
    const result = await db
        .select({
            meeting: meetings,
            property: properties,
        })
        .from(meetings)
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .orderBy(meetings.date);

    // Filter by organization membership
    const accessibleMeetings: Meeting[] = [];
    for (const { meeting, property } of result) {
        try {
            await requireMember(property.organizationId);
            accessibleMeetings.push(meeting);
        } catch {
            // User doesn't have access to this property's organization
            continue;
        }
    }

    return accessibleMeetings;
}

/**
 * Get meetings for a specific property
 */
export async function getMeetingsByProperty(
    propertyId: number,
): Promise<Meeting[]> {
    await requireAuth();
    const db = await getDb();

    // Check property access
    const property = await db
        .select()
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);

    if (!property.length) {
        throw new Error("Liegenschaft nicht gefunden");
    }

    await requireMember(property[0].organizationId);

    const result = await db
        .select()
        .from(meetings)
        .where(eq(meetings.propertyId, propertyId))
        .orderBy(meetings.date);

    return result;
}

/**
 * Get a single meeting by ID
 */
export async function getMeeting(meetingId: number): Promise<Meeting | null> {
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

        const now = new Date().toISOString();
        const result = await db
            .insert(meetings)
            .values({
                ...validatedData,
                createdAt: now,
                updatedAt: now,
            })
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
        const now = new Date().toISOString();

        await db
            .update(meetings)
            .set({
                ...validatedData,
                updatedAt: now,
            })
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
