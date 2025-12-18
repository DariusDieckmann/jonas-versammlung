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
import { organizationMembers } from "@/modules/organizations/shared/schemas/organization.schema";
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
 * Get all units with their owners for a specific property
 */
export async function getUnitsWithOwners(
    propertyId: number,
): Promise<Array<Unit & { owners: Owner[] }>> {
    const currentUser = await requireAuth();
    const db = await getDb();

    const result = await db
        .select({
            unit: units,
            owner: owners,
        })
        .from(units)
        .innerJoin(
            organizationMembers,
            eq(units.organizationId, organizationMembers.organizationId),
        )
        .leftJoin(owners, eq(owners.unitId, units.id))
        .where(
            and(
                eq(units.propertyId, propertyId),
                eq(organizationMembers.userId, currentUser.id),
            ),
        )
        .orderBy(units.name, owners.lastName, owners.firstName);

    if (result.length === 0) {
        return [];
    }

    // Group by unitId and collect owners
    const unitsMap = new Map<number, Unit & { owners: Owner[] }>();

    for (const row of result) {
        if (!unitsMap.has(row.unit.id)) {
            unitsMap.set(row.unit.id, {
                ...row.unit,
                owners: [],
            });
        }

        // Add owner if exists (LEFT JOIN can return null for owner)
        if (row.owner) {
            unitsMap.get(row.unit.id)!.owners.push(row.owner);
        }
    }

    return Array.from(unitsMap.values());
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
        const propertyResult = await db
            .select()
            .from(properties)
            .where(and(
                eq(properties.id, data.propertyId),
                eq(properties.organizationId, organization.id),
            ))
            .limit(1);

        if (!propertyResult.length) {
            return {
                success: false,
                error: "Liegenschaft nicht gefunden",
            };
        }

        const property = propertyResult[0];

        // Validate that total MEA doesn't exceed property's total MEA
        const existingUnits = await db
            .select()
            .from(units)
            .where(eq(units.propertyId, data.propertyId));

        const currentTotalMEA = existingUnits.reduce(
            (sum, unit) => sum + unit.ownershipShares,
            0,
        );
        const newTotalMEA = currentTotalMEA + validatedData.ownershipShares;

        if (newTotalMEA > property.mea) {
            return {
                success: false,
                error: `Die Summe der MEA würde ${newTotalMEA} betragen und damit ${property.mea.toLocaleString()} überschreiten. Verfügbar: ${property.mea - currentTotalMEA} MEA`,
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

        // Validate that total MEA doesn't exceed property's total MEA (if ownershipShares is being changed)
        if (validatedData.ownershipShares !== undefined) {
            // Get property to check its total MEA
            const propertyResult = await db
                .select()
                .from(properties)
                .where(and(
                    eq(properties.id, existing[0].propertyId),
                    eq(properties.organizationId, existing[0].organizationId),
                ))
                .limit(1);

            if (!propertyResult.length) {
                return {
                    success: false,
                    error: "Liegenschaft nicht gefunden",
                };
            }

            const property = propertyResult[0];

            const existingUnits = await db
                .select()
                .from(units)
                .where(eq(units.propertyId, existing[0].propertyId));

            const currentTotalMEA = existingUnits
                .filter((unit) => unit.id !== unitId) // Exclude current unit
                .reduce((sum, unit) => sum + unit.ownershipShares, 0);

            const newTotalMEA = currentTotalMEA + validatedData.ownershipShares;

            if (newTotalMEA > property.mea) {
                return {
                    success: false,
                    error: `Die Summe der MEA würde ${newTotalMEA} betragen und damit ${property.mea.toLocaleString()} überschreiten. Verfügbar: ${property.mea - currentTotalMEA} MEA`,
                };
            }
        }

        // Remove undefined values to prevent overwriting existing fields with NULL
        const updateData = Object.fromEntries(
            Object.entries(validatedData).filter(([_, value]) => value !== undefined)
        ) as Partial<typeof units.$inferInsert>;

        await db
            .update(units)
            .set(updateData)
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
