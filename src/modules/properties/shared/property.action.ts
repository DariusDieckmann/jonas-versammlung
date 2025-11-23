"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    requireMember,
    requireOwner,
} from "@/modules/organizations/shared/organization-permissions.action";
import {
    insertPropertySchema,
    properties,
    updatePropertySchema,
    type InsertProperty,
    type Property,
    type UpdateProperty,
} from "./schemas/property.schema";

/**
 * Get all properties for an organization
 */
export async function getProperties(
    organizationId: number,
): Promise<Property[]> {
    const user = await requireAuth();
    await requireMember(organizationId);

    const db = await getDb();

    const result = await db
        .select()
        .from(properties)
        .where(eq(properties.organizationId, organizationId))
        .orderBy(properties.name);

    return result;
}

/**
 * Get a single property by ID
 */
export async function getProperty(
    propertyId: number,
): Promise<Property | null> {
    const user = await requireAuth();
    const db = await getDb();

    const result = await db
        .select()
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);

    if (!result.length) {
        return null;
    }

    const property = result[0];
    await requireMember(property.organizationId);

    return property;
}

/**
 * Create a new property
 */
export async function createProperty(
    organizationId: number,
    data: InsertProperty,
): Promise<{ success: boolean; error?: string; propertyId?: number }> {
    try {
        const user = await requireAuth();
        await requireMember(organizationId);

        const validatedData = insertPropertySchema.parse(data);
        const db = await getDb();

        const now = new Date().toISOString();
        const result = await db
            .insert(properties)
            .values({
                ...validatedData,
                organizationId,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        revalidatePath("/dashboard/properties");
        return { success: true, propertyId: result[0].id };
    } catch (error) {
        console.error("Error creating property:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Erstellen der Liegenschaft",
        };
    }
}

/**
 * Update a property
 */
export async function updateProperty(
    propertyId: number,
    data: UpdateProperty,
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Get property to check organization
        const existing = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Liegenschaft nicht gefunden" };
        }

        await requireMember(existing[0].organizationId);

        const validatedData = updatePropertySchema.parse(data);
        const now = new Date().toISOString();

        await db
            .update(properties)
            .set({
                ...validatedData,
                updatedAt: now,
            })
            .where(eq(properties.id, propertyId));

        revalidatePath("/dashboard/properties");
        revalidatePath(`/dashboard/properties/${propertyId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating property:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren der Liegenschaft",
        };
    }
}

/**
 * Delete a property
 */
export async function deleteProperty(
    propertyId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Get property to check organization
        const existing = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Liegenschaft nicht gefunden" };
        }

        await requireOwner(existing[0].organizationId);

        await db.delete(properties).where(eq(properties.id, propertyId));

        revalidatePath("/dashboard/properties");
        return { success: true };
    } catch (error) {
        console.error("Error deleting property:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Löschen der Liegenschaft",
        };
    }
}
