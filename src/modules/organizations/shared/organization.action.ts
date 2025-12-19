"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { user } from "@/modules/auth/shared/schemas/auth.schema";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";
import type {
    OrganizationMemberWithUser,
    OrganizationWithMemberCount,
} from "./models/organization.model";
import {
    OrganizationRole,
    type OrganizationRoleType,
} from "./models/organization.model";
import { requireMember, requireOwner } from "./organization-permissions.action";
import {
    insertOrganizationMemberSchema,
    insertOrganizationSchema,
    type NewOrganization,
    type NewOrganizationMember,
    organizationMembers,
    organizations,
    updateOrganizationSchema,
} from "./schemas/organization.schema";
import settingsRoutes from "./settings.route";
import { inviteOrganizationMember } from "./invitation.action";

/**
 * Get all organizations for the current user
 */
export async function getUserOrganizations(): Promise<
    OrganizationWithMemberCount[]
> {
    const currentUser = await requireAuth();
    const db = await getDb();

    const userOrgs = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            createdBy: organizations.createdBy,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
            memberCount: sql<number>`count(${organizationMembers.id})`,
        })
        .from(organizations)
        .innerJoin(
            organizationMembers,
            eq(organizations.id, organizationMembers.organizationId),
        )
        .where(eq(organizationMembers.userId, currentUser.id))
        .groupBy(organizations.id)
        .orderBy(organizations.name);

    return userOrgs;
}

/**
 * Get a single organization by ID (only if user is a member)
 */
export async function getOrganization(
    organizationId: number,
): Promise<OrganizationWithMemberCount | null> {
    const currentUser = await requireAuth();
    const db = await getDb();

    const result = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            createdBy: organizations.createdBy,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
            memberCount: sql<number>`count(${organizationMembers.id})`,
        })
        .from(organizations)
        .innerJoin(
            organizationMembers,
            eq(organizations.id, organizationMembers.organizationId),
        )
        .where(
            and(
                eq(organizations.id, organizationId),
                eq(organizationMembers.userId, currentUser.id),
            ),
        )
        .groupBy(organizations.id)
        .limit(1);

    return result[0] || null;
}

/**
 * Create a new organization
 */
export async function createOrganization(data: {
    name: string;
}): Promise<{ success: boolean; organizationId?: number; error?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Validate input
        const validatedData = insertOrganizationSchema.parse({
            ...data,
            createdBy: currentUser.id,
        });

        // Create organization
        const result = await db
            .insert(organizations)
            .values(validatedData as NewOrganization)
            .returning();

        const newOrg = result[0];

        // Add creator as owner
        await db.insert(organizationMembers).values({
            organizationId: newOrg.id,
            userId: currentUser.id,
            role: OrganizationRole.OWNER,
        });

        revalidatePath(dashboardRoutes.dashboard);
        return { success: true, organizationId: newOrg.id };
    } catch (error) {
        console.error("Error creating organization:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create organization",
        };
    }
}

/**
 * Update an organization (only owners can update)
 */
export async function updateOrganization(
    organizationId: number,
    data: { name?: string },
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireOwner(organizationId);
        const db = await getDb();

        // Validate input
        const validatedData = updateOrganizationSchema.parse(data);

        // Update organization
        // Remove undefined values to prevent overwriting existing fields with NULL
        const updateData = Object.fromEntries(
            Object.entries(validatedData).filter(([_, value]) => value !== undefined)
        ) as Partial<typeof organizations.$inferInsert>;

        await db
            .update(organizations)
            .set(updateData)
            .where(eq(organizations.id, organizationId));

        revalidatePath(dashboardRoutes.dashboard);
        return { success: true };
    } catch (error) {
        console.error("Error updating organization:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Aktualisieren der Organisation",
        };
    }
}

/**
 * Delete an organization (only owners can delete)
 */
export async function deleteOrganization(
    organizationId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireOwner(organizationId);
        const db = await getDb();

        // Delete organization (cascade will delete members)
        await db
            .delete(organizations)
            .where(eq(organizations.id, organizationId));

        revalidatePath(dashboardRoutes.dashboard);
        return { success: true };
    } catch (error) {
        console.error("Error deleting organization:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Löschen der Organisation",
        };
    }
}

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(
    organizationId: number,
): Promise<OrganizationMemberWithUser[]> {
    await requireMember(organizationId);
    const db = await getDb();

    // Get all members with user info
    const members = await db
        .select({
            id: organizationMembers.id,
            organizationId: organizationMembers.organizationId,
            userId: organizationMembers.userId,
            role: organizationMembers.role,
            joinedAt: organizationMembers.joinedAt,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        })
        .from(organizationMembers)
        .innerJoin(user, eq(organizationMembers.userId, user.id))
        .where(eq(organizationMembers.organizationId, organizationId))
        .orderBy(organizationMembers.joinedAt);

    return members;
}

/**
 * Add a member to an organization by email (DEPRECATED - use inviteOrganizationMember instead)
 * This function now uses the invitation system
 */
export async function addOrganizationMember(
    email: string,
    role: OrganizationRoleType = OrganizationRole.MEMBER,
): Promise<{ success: boolean; error?: string }> {
    // Redirect to invitation system
    return inviteOrganizationMember(email, role);
}

/**
 * Remove a member from an organization
 * Pass "current-user" as userId to remove the current user (for leaving)
 */
export async function removeOrganizationMember(
    organizationId: number,
    userId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // If userId is "current-user", use the current user's ID
        const targetUserId =
            userId === "current-user" ? currentUser.id : userId;

        // If user is leaving themselves, skip owner check
        const isSelfLeaving = targetUserId === currentUser.id;

        if (!isSelfLeaving) {
            // Only owners can remove others
            await requireOwner(organizationId);
        }

        // Get member details before removing
        const memberToRemove = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, targetUserId),
                ),
            )
            .limit(1);

        if (!memberToRemove.length) {
            return {
                success: false,
                error: "Mitglied nicht in dieser Organisation gefunden",
            };
        }

        // Check if this is the last owner
        const ownerCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.role, OrganizationRole.OWNER),
                ),
            );

        if (
            memberToRemove[0]?.role === OrganizationRole.OWNER &&
            ownerCount[0].count <= 1
        ) {
            // If last owner is leaving, delete the entire organization
            if (isSelfLeaving) {
                await db
                    .delete(organizations)
                    .where(eq(organizations.id, organizationId));

                revalidatePath(dashboardRoutes.dashboard);
                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                    error: "Der letzte Owner kann nicht entfernt werden",
                };
            }
        }

        // Remove member
        await db
            .delete(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, targetUserId),
                ),
            );

        revalidatePath(dashboardRoutes.dashboard);
        revalidatePath(settingsRoutes.organization);
        return { success: true };
    } catch (error) {
        console.error("Error removing organization member:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Entfernen des Mitglieds",
        };
    }
}

/**
 * Check if user is a member of an organization
 */
export async function isOrganizationMember(
    organizationId: number,
): Promise<boolean> {
    const currentUser = await requireAuth();
    const db = await getDb();

    const membership = await db
        .select()
        .from(organizationMembers)
        .where(
            and(
                eq(organizationMembers.organizationId, organizationId),
                eq(organizationMembers.userId, currentUser.id),
            ),
        )
        .limit(1);

    return membership.length > 0;
}

/**
 * Update a member's role in an organization (only owners can do this)
 */
export async function updateMemberRole(
    organizationId: number,
    userId: string,
    newRole: OrganizationRoleType,
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        await requireOwner(organizationId);
        const db = await getDb();

        // Don't allow changing own role
        if (userId === currentUser.id) {
            return {
                success: false,
                error: "Du kannst deine eigene Rolle nicht ändern",
            };
        }

        // Update the member's role
        await db
            .update(organizationMembers)
            .set({ role: newRole })
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userId),
                ),
            );

        revalidatePath(settingsRoutes.organization);
        return { success: true };
    } catch (error) {
        console.error("Error updating member role:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Ändern der Rolle",
        };
    }
}
