"use server";

import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { deleteFromR2 } from "@/lib/r2";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import { agendaItems } from "./schemas/agenda-item.schema";
import {
    type AgendaItemAttachment,
    agendaItemAttachments,
    type InsertAgendaItemAttachment,
    insertAgendaItemAttachmentSchema,
} from "./schemas/agenda-item-attachment.schema";
import { meetings } from "./schemas/meeting.schema";

/**
 * Create an agenda item attachment
 */
export async function createAgendaItemAttachment(
    data: InsertAgendaItemAttachment,
): Promise<{ success: boolean; error?: string; data?: AgendaItemAttachment }> {
    try {
        const user = await requireAuth();
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
            .where(eq(agendaItems.id, data.agendaItemId))
            .limit(1);

        if (!agendaItem.length) {
            return {
                success: false,
                error: "Tagesordnungspunkt nicht gefunden",
            };
        }

        await requireMember(agendaItem[0].property.organizationId);

        const validatedData = insertAgendaItemAttachmentSchema.parse({
            ...data,
            uploadedBy: user.id,
        });

        const result = await db
            .insert(agendaItemAttachments)
            .values(validatedData)
            .returning();

        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating agenda item attachment:", error);
        return {
            success: false,
            error: "Fehler beim Speichern der Datei",
        };
    }
}

/**
 * Get all attachments for an agenda item
 */
export async function getAgendaItemAttachments(
    agendaItemId: number,
): Promise<AgendaItemAttachment[]> {
    await requireAuth();
    const db = await getDb();

    // Check access - verify agenda item belongs to user's organization
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
        throw new Error("Tagesordnungspunkt nicht gefunden");
    }

    await requireMember(agendaItem[0].property.organizationId);

    const result = await db
        .select()
        .from(agendaItemAttachments)
        .where(eq(agendaItemAttachments.agendaItemId, agendaItemId))
        .orderBy(agendaItemAttachments.createdAt);

    return result;
}

/**
 * Get all attachments for multiple agenda items
 */
export async function getAgendaItemAttachmentsByItems(
    agendaItemIds: number[],
): Promise<Map<number, AgendaItemAttachment[]>> {
    if (agendaItemIds.length === 0) {
        return new Map();
    }

    await requireAuth();
    const db = await getDb();

    // Fetch all attachments in one query using inArray
    const results = await db
        .select()
        .from(agendaItemAttachments)
        .where(inArray(agendaItemAttachments.agendaItemId, agendaItemIds))
        .orderBy(agendaItemAttachments.createdAt);

    // Group by agenda item ID
    const attachmentsMap = new Map<number, AgendaItemAttachment[]>();
    for (const attachment of results) {
        const existing = attachmentsMap.get(attachment.agendaItemId) || [];
        existing.push(attachment);
        attachmentsMap.set(attachment.agendaItemId, existing);
    }

    return attachmentsMap;
}

/**
 * Delete an agenda item attachment
 */
export async function deleteAgendaItemAttachment(
    attachmentId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get attachment to check access
        const attachment = await db
            .select({
                attachment: agendaItemAttachments,
                property: properties,
            })
            .from(agendaItemAttachments)
            .innerJoin(
                agendaItems,
                eq(agendaItemAttachments.agendaItemId, agendaItems.id),
            )
            .innerJoin(meetings, eq(agendaItems.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(agendaItemAttachments.id, attachmentId))
            .limit(1);

        if (!attachment.length) {
            return { success: false, error: "Datei nicht gefunden" };
        }

        await requireMember(attachment[0].property.organizationId);

        await db
            .delete(agendaItemAttachments)
            .where(eq(agendaItemAttachments.id, attachmentId));

        await deleteFromR2(attachment[0].attachment.r2Key);

        return { success: true };
    } catch (error) {
        console.error("Error deleting agenda item attachment:", error);
        return {
            success: false,
            error: "Fehler beim Löschen der Datei",
        };
    }
}
