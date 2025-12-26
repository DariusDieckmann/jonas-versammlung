"use server";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getUserOrganizationIds, requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import { agendaItems, MajorityType as AgendaItemMajorityType } from "./schemas/agenda-item.schema";
import { meetings } from "./schemas/meeting.schema";
import {
    insertResolutionSchema,
    type Resolution,
    resolutions,
} from "./schemas/resolution.schema";

/**
 * Create a resolution for an agenda item
 */
export async function createResolution(
    agendaItemId: number,
): Promise<{ success: boolean; error?: string; data?: Resolution }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check access
        const agendaItem = await db
            .select({
                agendaItem: agendaItems,
                property: properties,
            })
            .from(agendaItems)
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(agendaItems.id, agendaItemId))
            .limit(1);

        if (!agendaItem.length) {
            return {
                success: false,
                error: "Tagesordnungspunkt nicht gefunden",
            };
        }

        await requireMember(agendaItem[0].property.organizationId);

        // Check if resolution already exists
        const existing = await db
            .select()
            .from(resolutions)
            .where(eq(resolutions.agendaItemId, agendaItemId))
            .limit(1);

        if (existing.length > 0) {
            return { success: true, data: existing[0] };
        }

        const validatedData = insertResolutionSchema.parse({
            agendaItemId,
        });

        const result = await db
            .insert(resolutions)
            .values(validatedData)
            .returning();

        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating resolution:", error);
        return {
            success: false,
            error: "Fehler beim Erstellen des Beschlusses",
        };
    }
}

/**
 * Get resolution for an agenda item
 */
export async function getResolution(
    agendaItemId: number,
): Promise<Resolution | null> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select()
        .from(resolutions)
        .where(eq(resolutions.agendaItemId, agendaItemId))
        .limit(1);

    return result.length > 0 ? result[0] : null;
}

/**
 * Get resolutions for multiple agenda items
 * NOTE: This function assumes agendaItemIds have already been validated
 * to belong to the user's organization. Only use after checking access!
 */
export async function getResolutionsByAgendaItems(
    agendaItemIds: number[],
): Promise<Map<number, Resolution>> {
    if (agendaItemIds.length === 0) {
        return new Map();
    }

    await requireAuth();
    const db = await getDb();

    // Security check: Verify all agenda items belong to user's organizations
    const userOrgIds = await getUserOrganizationIds();
    
    const validatedResolutions = await db
        .select({
            resolution: resolutions,
        })
        .from(resolutions)
        .innerJoin(agendaItems, eq(resolutions.agendaItemId, agendaItems.id))
        .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
        .innerJoin(properties, eq(meetings.propertyId, properties.id))
        .where(
            and(
                inArray(resolutions.agendaItemId, agendaItemIds),
                inArray(properties.organizationId, userOrgIds)
            )
        );

    const resolutionMap = new Map<number, Resolution>();

    for (const { resolution } of validatedResolutions) {
        resolutionMap.set(resolution.agendaItemId, resolution);
    }

    return resolutionMap;
}

/**
 * Mark an agenda item as completed (for items without voting)
 * Creates a resolution without votes to track completion
 */
export async function markAgendaItemCompleted(
    agendaItemId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Check access
        const agendaItem = await db
            .select({
                agendaItem: agendaItems,
                property: properties,
            })
            .from(agendaItems)
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(agendaItems.id, agendaItemId))
            .limit(1);

        if (!agendaItem.length) {
            return {
                success: false,
                error: "Tagesordnungspunkt nicht gefunden",
            };
        }

        await requireMember(agendaItem[0].property.organizationId);

        // Check if resolution already exists
        const existing = await db
            .select()
            .from(resolutions)
            .where(eq(resolutions.agendaItemId, agendaItemId))
            .limit(1);

        if (existing.length > 0) {
            return { success: true };
        }

        // Create a resolution without votes to mark as completed
        await db.insert(resolutions).values({
            agendaItemId,
        });

        return { success: true };
    } catch (error) {
        console.error("Error marking agenda item as completed:", error);
        return {
            success: false,
            error: "Fehler beim Markieren als erledigt",
        };
    }
}
