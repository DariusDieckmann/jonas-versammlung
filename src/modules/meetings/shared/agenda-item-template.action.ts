"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    agendaItemTemplates,
    type InsertAgendaItemTemplate,
    insertAgendaItemTemplateSchema,
    type UpdateAgendaItemTemplate,
} from "./schemas/agenda-item-template.schema";
import { requireMember } from "@/modules/organizations/shared/organization-permissions.action";

/**
 * Get all agenda item templates for an organization
 */
export async function getAgendaItemTemplates(organizationId: number) {
    await requireAuth();
    const db = await getDb();

    await requireMember(organizationId);

    const templates = await db
        .select()
        .from(agendaItemTemplates)
        .where(eq(agendaItemTemplates.organizationId, organizationId))
        .orderBy(agendaItemTemplates.title);


    return templates;
}

/**
 * Get a single agenda item template
 */
export async function getAgendaItemTemplate(templateId: number) {
    await requireAuth();
    const db = await getDb();

    const template = await db
        .select()
        .from(agendaItemTemplates)
        .where(eq(agendaItemTemplates.id, templateId))
        .limit(1);

    if (!template.length) {
        return null;
    }
    
    await requireMember(template[0].organizationId);
    return template[0];
}

/**
 * Create a new agenda item template
 */
export async function createAgendaItemTemplate(
    data: InsertAgendaItemTemplate,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();
        await requireMember(data.organizationId);

        const now = new Date().toISOString();

        const validatedData = insertAgendaItemTemplateSchema.parse(data);

        await db.insert(agendaItemTemplates).values({
            ...validatedData,
            createdAt: now,
            updatedAt: now,
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating agenda item template:", error);
        return {
            success: false,
            error: "Fehler beim Erstellen der Vorlage",
        };
    }
}

/**
 * Update an agenda item template
 */
export async function updateAgendaItemTemplate(
    templateId: number,
    data: UpdateAgendaItemTemplate,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        const existing = await db
            .select()
            .from(agendaItemTemplates)
            .where(eq(agendaItemTemplates.id, templateId))
            .limit(1);
        
        if (!existing.length) {
            return { success: false, error: "Vorlage nicht gefunden" };
        }
        
        await requireMember(existing[0].organizationId);

        const now = new Date().toISOString();

        await db
            .update(agendaItemTemplates)
            .set({
                ...data,
                updatedAt: now,
            })
            .where(eq(agendaItemTemplates.id, templateId));

        return { success: true };
    } catch (error) {
        console.error("Error updating agenda item template:", error);
        return {
            success: false,
            error: "Fehler beim Aktualisieren der Vorlage",
        };
    }
}

/**
 * Delete an agenda item template
 */
export async function deleteAgendaItemTemplate(
    templateId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        const existing = await db
            .select()
            .from(agendaItemTemplates)
            .where(eq(agendaItemTemplates.id, templateId))
            .limit(1);
        
        if (!existing.length) {
            return { success: false, error: "Vorlage nicht gefunden" };
        }
        
        await requireMember(existing[0].organizationId);

        await db
            .delete(agendaItemTemplates)
            .where(eq(agendaItemTemplates.id, templateId));

        return { success: true };
    } catch (error) {
        console.error("Error deleting agenda item template:", error);
        return {
            success: false,
            error: "Fehler beim Löschen der Vorlage",
        };
    }
}
