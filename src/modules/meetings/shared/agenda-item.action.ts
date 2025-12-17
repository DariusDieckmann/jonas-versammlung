"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import meetingsRoutes from "./meetings.route";
import {
    type AgendaItem,
    agendaItems,
    type InsertAgendaItem,
    insertAgendaItemSchema,
    type UpdateAgendaItem,
    updateAgendaItemSchema,
} from "./schemas/agenda-item.schema";
import { meetings } from "./schemas/meeting.schema";

/**
 * Get all agenda items for a meeting
 */
export async function getAgendaItems(meetingId: number): Promise<AgendaItem[]> {
    await requireAuth();
    const db = await getDb();

    // Get meeting with property to check organization
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
        throw new Error("Versammlung nicht gefunden");
    }

    await requireMember(meeting[0].property.organizationId);

    const result = await db
        .select()
        .from(agendaItems)
        .where(eq(agendaItems.meetingId, meetingId))
        .orderBy(asc(agendaItems.orderIndex));

    return result;
}

/**
 * Get a single agenda item
 */
export async function getAgendaItem(
    agendaItemId: number,
): Promise<AgendaItem | null> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select({
            agendaItem: agendaItems,
            meeting: meetings,
            property: properties,
        })
        .from(agendaItems)
        .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(eq(agendaItems.id, agendaItemId))
        .limit(1);

    if (!result.length) {
        return null;
    }

    await requireMember(result[0].property.organizationId);

    return result[0].agendaItem;
}

/**
 * Create a new agenda item
 */
export async function createAgendaItem(
    data: InsertAgendaItem,
): Promise<{ success: boolean; error?: string; agendaItemId?: number }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check meeting access
        const meeting = await db
            .select({
                meeting: meetings,
                property: properties,
            })
            .from(meetings)
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetings.id, data.meetingId))
            .limit(1);

        if (!meeting.length) {
            return {
                success: false,
                error: "Versammlung nicht gefunden",
            };
        }

        await requireMember(meeting[0].property.organizationId);

        const validatedData = insertAgendaItemSchema.parse(data);

        const result = await db
            .insert(agendaItems)
            .values(validatedData)
            .returning();

        revalidatePath(meetingsRoutes.detail(data.meetingId));
        return { success: true, agendaItemId: result[0].id };
    } catch (error) {
        console.error("Error creating agenda item:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Erstellen des Tagesordnungspunkts",
        };
    }
}

/**
 * Create multiple agenda items at once
 */
export async function createAgendaItems(
    meetingId: number,
    items: Omit<InsertAgendaItem, "meetingId">[],
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check meeting access
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
            return {
                success: false,
                error: "Versammlung nicht gefunden",
            };
        }

        await requireMember(meeting[0].property.organizationId);

        if (items.length === 0) {
            return { success: true };
        }

        const values = items.map((item, index) => ({
            ...item,
            meetingId,
            orderIndex: index,
        }));

        await db.insert(agendaItems).values(values);

        revalidatePath(meetingsRoutes.detail(meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error creating agenda items:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Erstellen der Tagesordnungspunkte",
        };
    }
}

/**
 * Update an agenda item
 */
export async function updateAgendaItem(
    agendaItemId: number,
    data: UpdateAgendaItem,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get agenda item with meeting and property to check organization
        const existing = await db
            .select({
                agendaItem: agendaItems,
                meeting: meetings,
                property: properties,
            })
            .from(agendaItems)
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(agendaItems.id, agendaItemId))
            .limit(1);

        if (!existing.length) {
            return {
                success: false,
                error: "Tagesordnungspunkt nicht gefunden",
            };
        }

        await requireMember(existing[0].property.organizationId);

        const validatedData = updateAgendaItemSchema.parse(data);

        await db
            .update(agendaItems)
            .set(validatedData)
            .where(eq(agendaItems.id, agendaItemId));

        revalidatePath(meetingsRoutes.detail(existing[0].agendaItem.meetingId));

        return { success: true };
    } catch (error) {
        console.error("Error updating agenda item:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren des Tagesordnungspunkts",
        };
    }
}

/**
 * Update only title and description of an agenda item
 * This is a safe function for use during conduct, as it only updates content fields
 * and never touches configuration fields like requiresResolution or majorityType
 */
export async function updateAgendaItemContent(
    agendaItemId: number,
    data: {
        title?: string;
        description?: string | null;
    },
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get agenda item with meeting and property to check organization
        const existing = await db
            .select({
                agendaItem: agendaItems,
                meeting: meetings,
                property: properties,
            })
            .from(agendaItems)
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(agendaItems.id, agendaItemId))
            .limit(1);

        if (!existing.length) {
            return {
                success: false,
                error: "Tagesordnungspunkt nicht gefunden",
            };
        }

        await requireMember(existing[0].property.organizationId);

        // Build update object with only provided fields
        const updateData: { title?: string; description?: string | null } = {};

        if (data.title !== undefined) {
            updateData.title = data.title;
        }

        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        // Only update if there's something to update
        if (Object.keys(updateData).length === 0) {
            return { success: true }; // Nothing to update
        }

        await db
            .update(agendaItems)
            .set(updateData)
            .where(eq(agendaItems.id, agendaItemId));

        revalidatePath(meetingsRoutes.detail(existing[0].agendaItem.meetingId));

        return { success: true };
    } catch (error) {
        console.error("Error updating agenda item content:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren des Tagesordnungspunkts",
        };
    }
}

/**
 * Delete an agenda item
 */
export async function deleteAgendaItem(
    agendaItemId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get agenda item with meeting and property to check organization
        const existing = await db
            .select({
                agendaItem: agendaItems,
                meeting: meetings,
                property: properties,
            })
            .from(agendaItems)
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(agendaItems.id, agendaItemId))
            .limit(1);

        if (!existing.length) {
            return {
                success: false,
                error: "Tagesordnungspunkt nicht gefunden",
            };
        }

        await requireMember(existing[0].property.organizationId);

        await db.delete(agendaItems).where(eq(agendaItems.id, agendaItemId));

        revalidatePath(meetingsRoutes.detail(existing[0].agendaItem.meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting agenda item:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Löschen des Tagesordnungspunkts",
        };
    }
}

/**
 * Reorder agenda items
 */
export async function reorderAgendaItems(
    meetingId: number,
    itemIds: number[],
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check meeting access
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
            return {
                success: false,
                error: "Versammlung nicht gefunden",
            };
        }

        await requireMember(meeting[0].property.organizationId);

        // Update each item's order index 
        await Promise.all(
            itemIds.map((itemId, index) =>
                db
                    .update(agendaItems)
                    .set({
                        orderIndex: index,
                    })
                    .where(
                        and(
                            eq(agendaItems.id, itemId),
                            eq(agendaItems.meetingId, meetingId),
                        ),
                    ),
            ),
        );

        revalidatePath(meetingsRoutes.detail(meetingId));
        return { success: true };
    } catch (error) {
        console.error("Error reordering agenda items:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Sortieren der Tagesordnungspunkte",
        };
    }
}
