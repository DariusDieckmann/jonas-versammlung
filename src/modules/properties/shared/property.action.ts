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
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import propertiesRoutes from "../properties.route";

/**
 * Get all properties for the user's organization
 */
export async function getProperties(): Promise<Property[]> {
    const user = await requireAuth();
    const db = await getDb();

    // Get user's organization
    const organizations = await getUserOrganizations();
    const organization = organizations[0];

    if (!organization) {
        return [];
    }

    await requireMember(organization.id);

    const result = await db
        .select()
        .from(properties)
        .where(eq(properties.organizationId, organization.id))
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
 * Create a new property in the user's organization
 */
export async function createProperty(
    data: InsertProperty,
): Promise<{ success: boolean; error?: string; propertyId?: number }> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Get user's organization
        const organizations = await getUserOrganizations();
        const organization = organizations[0];

        if (!organization) {
            return {
                success: false,
                error: "Du musst zuerst einer Organisation beitreten",
            };
        }

        const validatedData = insertPropertySchema.parse(data);

        const now = new Date().toISOString();
        const result = await db
            .insert(properties)
            .values({
                ...validatedData,
                organizationId: organization.id,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        revalidatePath(propertiesRoutes.list);
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

        revalidatePath(propertiesRoutes.list);
        revalidatePath(propertiesRoutes.detail(propertyId));

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

        revalidatePath(propertiesRoutes.list);
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
