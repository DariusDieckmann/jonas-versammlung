"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import {
    resolutions,
    insertResolutionSchema,
    type Resolution,
    type MajorityType,
} from "./schemas/resolution.schema";
import { agendaItems } from "./schemas/agenda-item.schema";
import { meetings } from "./schemas/meeting.schema";
import { properties } from "@/modules/properties/shared/schemas/property.schema";

/**
 * Create a resolution for an agenda item
 */
export async function createResolution(
    agendaItemId: number,
    data: {
        majorityType?: MajorityType;
    },
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
            return { success: false, error: "Tagesordnungspunkt nicht gefunden" };
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

        const now = new Date().toISOString();

        const validatedData = insertResolutionSchema.parse({
            agendaItemId,
            majorityType: data.majorityType || "simple",
        });

        const result = await db.insert(resolutions).values({
            ...validatedData,
            createdAt: now,
            updatedAt: now,
        }).returning();

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
export async function getResolution(agendaItemId: number): Promise<Resolution | null> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select()
        .from(resolutions)
        .where(eq(resolutions.agendaItemId, agendaItemId))
        .limit(1);

    return result.length > 0 ? result[0] : null;
}
