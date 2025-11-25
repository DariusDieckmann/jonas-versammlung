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
import { units } from "@/modules/units/shared/schemas/unit.schema";

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
 * Get owners for a specific unit
 */
export async function getOwnersByUnit(unitId: number): Promise<Owner[]> {
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
                eq(owners.unitId, unitId)
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

        // Get unit to find propertyId for revalidation
        const unit = await db.query.units.findFirst({
            where: and(
                eq(units.id, data.unitId),
                eq(units.organizationId, organization.id)
            ),
        });

        if (!unit) {
            return {
                success: false,
                error: "Einheit nicht gefunden",
            };
        }

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

        revalidatePath(`/properties/${unit.propertyId}`);
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

        // Note: unitId cannot be changed via update (security)
        await db
            .update(owners)
            .set({
                ...validatedData,
                updatedAt: now,
            })
            .where(eq(owners.id, ownerId));

        // Get unit to find propertyId for revalidation
        const unit = await db.query.units.findFirst({
            where: eq(units.id, existing[0].unitId),
        });

        if (unit) {
            revalidatePath(`/properties/${unit.propertyId}`);
        }

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

        // Get unit to find propertyId for revalidation
        const unit = await db.query.units.findFirst({
            where: eq(units.id, existing[0].unitId),
        });

        await db.delete(owners).where(eq(owners.id, ownerId));

        if (unit) {
            revalidatePath(`/properties/${unit.propertyId}`);
        }

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
