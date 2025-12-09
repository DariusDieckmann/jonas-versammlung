"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import {
    requireMember,
    requireOwner,
} from "@/modules/organizations/shared/organization-permissions.action";
import {
    type Owner,
    owners,
} from "@/modules/owners/shared/schemas/owner.schema";
import propertiesRoutes from "@/modules/properties/shared/properties.route";
import { properties } from "@/modules/properties/shared/schemas/property.schema";
import {
    type InsertUnit,
    insertUnitSchema,
    type Unit,
    type UpdateUnit,
    units,
    updateUnitSchema,
} from "./schemas/unit.schema";

/**
 * Get all units for a specific property
 */
export async function getUnitsByProperty(propertyId: number): Promise<Unit[]> {
    await requireAuth();
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
        .from(units)
        .where(
            and(
                eq(units.organizationId, organization.id),
                eq(units.propertyId, propertyId),
            ),
        )
        .orderBy(units.name);

    return result;
}

/**
 * Get all units with their owners for a specific property
 */
export async function getUnitsWithOwners(
    propertyId: number,
): Promise<Array<Unit & { owners: Owner[] }>> {
    await requireAuth();
    const db = await getDb();

    // Get user's organization
    const organizations = await getUserOrganizations();
    const organization = organizations[0];

    if (!organization) {
        return [];
    }

    await requireMember(organization.id);

    // Get all units for the property
    const unitsResult = await db
        .select()
        .from(units)
        .where(
            and(
                eq(units.organizationId, organization.id),
                eq(units.propertyId, propertyId),
            ),
        )
        .orderBy(units.name);

    // Get all owners for these units
    const unitIds = unitsResult.map((u) => u.id);

    if (unitIds.length === 0) {
        return [];
    }

    const ownersResult = await db
        .select()
        .from(owners)
        .where(
            and(
                eq(owners.organizationId, organization.id),
                inArray(owners.unitId, unitIds),
            ),
        )
        .orderBy(owners.lastName, owners.firstName);

    // Group owners by unitId
    const ownersByUnit = ownersResult.reduce(
        (acc, owner) => {
            if (!acc[owner.unitId]) {
                acc[owner.unitId] = [];
            }
            acc[owner.unitId].push(owner);
            return acc;
        },
        {} as Record<number, Owner[]>,
    );

    // Combine units with their owners
    return unitsResult.map((unit) => ({
        ...unit,
        owners: ownersByUnit[unit.id] || [],
    }));
}

/**
 * Get a single unit by ID
 */
export async function getUnit(unitId: number): Promise<Unit | null> {
    await requireAuth();
    const db = await getDb();

    const result = await db
        .select()
        .from(units)
        .where(eq(units.id, unitId))
        .limit(1);

    if (!result.length) {
        return null;
    }

    const unit = result[0];
    await requireMember(unit.organizationId);

    return unit;
}

/**
 * Create a new unit
 */
export async function createUnit(
    data: InsertUnit,
): Promise<{ success: boolean; error?: string; unitId?: number }> {
    try {
        await requireAuth();
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

        const validatedData = insertUnitSchema.parse(data);

        // SECURITY: Verify that the property belongs to the user's organization
        const property = await db.query.properties.findFirst({
            where: and(
                eq(properties.id, data.propertyId),
                eq(properties.organizationId, organization.id),
            ),
        });

        if (!property) {
            return {
                success: false,
                error: "Liegenschaft nicht gefunden",
            };
        }

        // Validate that total MEA doesn't exceed 1000
        const existingUnits = await db
            .select()
            .from(units)
            .where(eq(units.propertyId, data.propertyId));

        const currentTotalMEA = existingUnits.reduce(
            (sum, unit) => sum + unit.ownershipShares,
            0,
        );
        const newTotalMEA = currentTotalMEA + validatedData.ownershipShares;

        if (newTotalMEA > 1000) {
            return {
                success: false,
                error: `Die Summe der MEA würde ${newTotalMEA} betragen und damit 1.000 überschreiten. Verfügbar: ${1000 - currentTotalMEA} MEA`,
            };
        }

        const result = await db
            .insert(units)
            .values({
                ...validatedData,
                organizationId: organization.id,
            })
            .returning();

        revalidatePath(propertiesRoutes.detail(data.propertyId));
        return { success: true, unitId: result[0].id };
    } catch (error) {
        console.error("Error creating unit:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Erstellen der Einheit",
        };
    }
}

/**
 * Update a unit
 */
export async function updateUnit(
    unitId: number,
    data: UpdateUnit,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get unit to check organization
        const existing = await db
            .select()
            .from(units)
            .where(eq(units.id, unitId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Einheit nicht gefunden" };
        }

        await requireMember(existing[0].organizationId);

        const validatedData = updateUnitSchema.parse(data);

        // Validate that total MEA doesn't exceed 1000 (if ownershipShares is being changed)
        if (validatedData.ownershipShares !== undefined) {
            const existingUnits = await db
                .select()
                .from(units)
                .where(eq(units.propertyId, existing[0].propertyId));

            const currentTotalMEA = existingUnits
                .filter((unit) => unit.id !== unitId) // Exclude current unit
                .reduce((sum, unit) => sum + unit.ownershipShares, 0);

            const newTotalMEA = currentTotalMEA + validatedData.ownershipShares;

            if (newTotalMEA > 1000) {
                return {
                    success: false,
                    error: `Die Summe der MEA würde ${newTotalMEA} betragen und damit 1.000 überschreiten. Verfügbar: ${1000 - currentTotalMEA} MEA`,
                };
            }
        }

        await db
            .update(units)
            .set(validatedData)
            .where(eq(units.id, unitId));

        revalidatePath(propertiesRoutes.detail(existing[0].propertyId));

        return { success: true };
    } catch (error) {
        console.error("Error updating unit:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren der Einheit",
        };
    }
}

/**
 * Delete a unit
 */
export async function deleteUnit(
    unitId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAuth();
        const db = await getDb();

        // Get unit to check organization
        const existing = await db
            .select()
            .from(units)
            .where(eq(units.id, unitId))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: "Einheit nicht gefunden" };
        }

        await requireOwner(existing[0].organizationId);

        await db.delete(units).where(eq(units.id, unitId));

        revalidatePath(propertiesRoutes.detail(existing[0].propertyId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting unit:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Löschen der Einheit",
        };
    }
}
