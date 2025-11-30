"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import { deleteFromR2 } from "@/lib/r2";
import { meetings } from "./schemas/meeting.schema";
import {
    type InsertMeetingAttachment,
    insertMeetingAttachmentSchema,
    type MeetingAttachment,
    meetingAttachments,
} from "./schemas/meeting-attachment.schema";

/**
 * Create a meeting attachment
 */
export async function createMeetingAttachment(
    data: InsertMeetingAttachment,
): Promise<{ success: boolean; error?: string; data?: MeetingAttachment }> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Check access
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
            return { success: false, error: "Versammlung nicht gefunden" };
        }

        await requireMember(meeting[0].property.organizationId);

        const now = new Date().toISOString();

        const validatedData = insertMeetingAttachmentSchema.parse({
            ...data,
            uploadedBy: user.id,
        });

        const result = await db
            .insert(meetingAttachments)
            .values({
                ...validatedData,
                createdAt: now,
            })
            .returning();

        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating meeting attachment:", error);
        return {
            success: false,
            error: "Fehler beim Speichern der Datei",
        };
    }
}

/**
 * Get all attachments for a meeting
 */
export async function getMeetingAttachments(
    meetingId: number,
): Promise<MeetingAttachment[]> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select()
        .from(meetingAttachments)
        .where(eq(meetingAttachments.meetingId, meetingId))
        .orderBy(meetingAttachments.createdAt);

    return result;
}

/**
 * Delete a meeting attachment
 */
export async function deleteMeetingAttachment(
    attachmentId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get attachment to check access and get R2 key
        const attachment = await db
            .select({
                attachment: meetingAttachments,
                property: properties,
            })
            .from(meetingAttachments)
            .innerJoin(meetings, eq(meetingAttachments.meetingId, meetings.id))
            .innerJoin(properties, eq(meetings.propertyId, properties.id))
            .where(eq(meetingAttachments.id, attachmentId))
            .limit(1);

        if (!attachment.length) {
            return { success: false, error: "Datei nicht gefunden" };
        }

        await requireMember(attachment[0].property.organizationId);

        // Delete from R2 bucket
        await deleteFromR2(attachment[0].attachment.r2Key);

        await db
            .delete(meetingAttachments)
            .where(eq(meetingAttachments.id, attachmentId));

        return { success: true };
    } catch (error) {
        console.error("Error deleting meeting attachment:", error);
        return {
            success: false,
            error: "Fehler beim Löschen der Datei",
        };
    }
}
