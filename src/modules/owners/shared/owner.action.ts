"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    requireMember,
    requireOwner,
} from "@/modules/organizations/shared/organization-permissions.action";
import {
    insertOwnerSchema,
    owners,
    updateOwnerSchema,
    type InsertOwner,
    type Owner,
    type UpdateOwner,
} from "./schemas/owner.schema";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";

/**
 * Get all owners for the user's organization
 */
export async function getOwners(): Promise<Owner[]> {
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
        .from(owners)
        .where(eq(owners.organizationId, organization.id))
        .orderBy(owners.lastName, owners.firstName);

    return result;
}

/**
 * Get owners for a specific property
 */
export async function getOwnersByProperty(propertyId: number): Promise<Owner[]> {
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
        .from(owners)
        .where(
            and(
                eq(owners.organizationId, organization.id),
                eq(owners.propertyId, propertyId)
            )
        )
        .orderBy(owners.lastName, owners.firstName);

    return result;
}

/**
 * Get a single owner by ID
 */
export async function getOwner(ownerId: number): Promise<Owner | null> {
    const user = await requireAuth();
    const db = await getDb();

    const result = await db
        .select()
        .from(owners)
        .where(eq(owners.id, ownerId))
        .limit(1);

    if (!result.length) {
        return null;
    }

    const owner = result[0];
    await requireMember(owner.organizationId);

    return owner;
}

/**
 * Create a new owner in the user's organization
 */
export async function createOwner(
    data: InsertOwner,
): Promise<{ success: boolean; error?: string; ownerId?: number }> {
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

        await requireMember(organization.id);

        const validatedData = insertOwnerSchema.parse(data);

        const now = new Date().toISOString();
        const result = await db
            .insert(owners)
            .values({
                ...validatedData,
                organizationId: organization.id,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        revalidatePath("/dashboard/owners");
        revalidatePath(`/dashboard/properties/${data.propertyId}`);
        return { success: true, ownerId: result[0].id };
    } catch (error) {
        console.error("Error creating owner:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Erstellen des Eigentümers",
        };
    }
}

/**
 * Update an owner
 */
export async function updateOwner(
    ownerId: number,
    data: UpdateOwner,
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Get owner to check organization
        const existing = await db
            .select()
            .from(owners)
            .where(eq(owners.id, ownerId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Eigentümer nicht gefunden" };
        }

        await requireMember(existing[0].organizationId);

        const validatedData = updateOwnerSchema.parse(data);
        const now = new Date().toISOString();

        await db
            .update(owners)
            .set({
                ...validatedData,
                updatedAt: now,
            })
            .where(eq(owners.id, ownerId));

        revalidatePath("/dashboard/owners");
        revalidatePath(`/dashboard/owners/${ownerId}`);
        revalidatePath(`/dashboard/properties/${existing[0].propertyId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating owner:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren des Eigentümers",
        };
    }
}

/**
 * Delete an owner
 */
export async function deleteOwner(
    ownerId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Get owner to check organization
        const existing = await db
            .select()
            .from(owners)
            .where(eq(owners.id, ownerId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Eigentümer nicht gefunden" };
        }

        await requireOwner(existing[0].organizationId);

        await db.delete(owners).where(eq(owners.id, ownerId));

        revalidatePath("/dashboard/owners");
        revalidatePath(`/dashboard/properties/${existing[0].propertyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting owner:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Löschen des Eigentümers",
        };
    }
}
