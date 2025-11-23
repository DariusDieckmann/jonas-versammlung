"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    type NewOrganization,
    type NewOrganizationMember,
    insertOrganizationMemberSchema,
    insertOrganizationSchema,
    organizationMembers,
    organizations,
    updateOrganizationSchema,
} from "./schemas/organization.schema";
import { user } from "@/modules/auth/shared/schemas/auth.schema";
import type {
    OrganizationMemberWithUser,
    OrganizationWithMemberCount,
} from "./models/organization.model";

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
            role: "owner",
        });

        revalidatePath("/dashboard");
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
        const currentUser = await requireAuth();
        const db = await getDb();

        // Check if user is owner
        const membership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, currentUser.id),
                    eq(organizationMembers.role, "owner"),
                ),
            )
            .limit(1);

        if (!membership.length) {
            return {
                success: false,
                error: "Only organization owners can update the organization",
            };
        }

        // Validate input
        const validatedData = updateOrganizationSchema.parse(data);

        // Update organization
        await db
            .update(organizations)
            .set({
                ...validatedData,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(organizations.id, organizationId));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating organization:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update organization",
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
        const currentUser = await requireAuth();
        const db = await getDb();

        // Check if user is owner
        const membership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, currentUser.id),
                    eq(organizationMembers.role, "owner"),
                ),
            )
            .limit(1);

        if (!membership.length) {
            return {
                success: false,
                error: "Only organization owners can delete the organization",
            };
        }

        // Delete organization (cascade will delete members, todos, categories)
        await db
            .delete(organizations)
            .where(eq(organizations.id, organizationId));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting organization:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete organization",
        };
    }
}

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(
    organizationId: number,
): Promise<OrganizationMemberWithUser[]> {
    const currentUser = await requireAuth();
    const db = await getDb();

    // Check if user is a member
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

    if (!membership.length) {
        throw new Error("You are not a member of this organization");
    }

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
 * Add a member to an organization by email
 */
export async function addOrganizationMember(
    organizationId: number,
    email: string,
    role: "owner" | "member" = "member",
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Check if current user is owner
        const currentMembership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, currentUser.id),
                    eq(organizationMembers.role, "owner"),
                ),
            )
            .limit(1);

        if (!currentMembership.length) {
            return {
                success: false,
                error: "Only organization owners can add members",
            };
        }

        // Find user by email
        const userToAdd = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (!userToAdd.length) {
            return { success: false, error: "User not found" };
        }

        // Check if user is already a member
        const existingMembership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userToAdd[0].id),
                ),
            )
            .limit(1);

        if (existingMembership.length) {
            return { success: false, error: "User is already a member" };
        }

        // Validate input
        const validatedData = insertOrganizationMemberSchema.parse({
            organizationId,
            userId: userToAdd[0].id,
            role,
        });

        // Add member
        await db
            .insert(organizationMembers)
            .values(validatedData as NewOrganizationMember);

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error adding organization member:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to add member",
        };
    }
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
        const targetUserId = userId === "current-user" ? currentUser.id : userId;

        // If user is leaving themselves, skip owner check
        const isSelfLeaving = targetUserId === currentUser.id;

        if (!isSelfLeaving) {
            // Check if current user is owner (only owners can remove others)
            const currentMembership = await db
                .select()
                .from(organizationMembers)
                .where(
                    and(
                        eq(organizationMembers.organizationId, organizationId),
                        eq(organizationMembers.userId, currentUser.id),
                        eq(organizationMembers.role, "owner"),
                    ),
                )
                .limit(1);

            if (!currentMembership.length) {
                return {
                    success: false,
                    error: "Only organization owners can remove members",
                };
            }
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
                error: "Member not found in this organization",
            };
        }

        // Check if this is the last owner
        const ownerCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.role, "owner"),
                ),
            );

        if (
            memberToRemove[0]?.role === "owner" &&
            ownerCount[0].count <= 1
        ) {
            // If last owner is leaving, delete the entire organization
            if (isSelfLeaving) {
                await db
                    .delete(organizations)
                    .where(eq(organizations.id, organizationId));

                revalidatePath("/dashboard");
                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                    error: "Cannot remove the last owner",
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

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error removing organization member:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to remove member",
        };
    }
}

/**
 * Check if user is a member of an organization
 */
export async function isOrganizationMember(
    organizationId: number,
): Promise<boolean> {
    try {
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
    } catch {
        return false;
    }
}

/**
 * Update a member's role in an organization (only owners can do this)
 */
export async function updateMemberRole(
    organizationId: number,
    userId: string,
    newRole: "owner" | "member",
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Check if current user is owner
        const currentMembership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, currentUser.id),
                    eq(organizationMembers.role, "owner"),
                ),
            )
            .limit(1);

        if (!currentMembership.length) {
            return {
                success: false,
                error: "Nur Owner können Rollen ändern",
            };
        }

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

        revalidatePath("/dashboard/settings/organization");
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
