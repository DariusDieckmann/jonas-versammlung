"use server";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { organizationMembers } from "./schemas/organization.schema";
import { OrganizationRole, type OrganizationRoleType } from "./models/organization.model";

/**
 * Check if the current user is an owner of the organization
 */
export async function isOwner(organizationId: number): Promise<boolean> {
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
                    eq(organizationMembers.role, OrganizationRole.OWNER),
                ),
            )
            .limit(1);

        return membership.length > 0;
    } catch {
        return false;
    }
}

/**
 * Check if the current user is a member of the organization
 */
export async function isMember(organizationId: number): Promise<boolean> {
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
 * Require that the current user is an owner of the organization
 * Throws an error if not
 */
export async function requireOwner(organizationId: number): Promise<void> {
    const isUserOwner = await isOwner(organizationId);
    
    if (!isUserOwner) {
        throw new Error("Nur Owner haben Zugriff auf diese Funktion");
    }
}

/**
 * Require that the current user is a member of the organization
 * Throws an error if not
 */
export async function requireMember(organizationId: number): Promise<void> {
    const isUserMember = await isMember(organizationId);
    
    if (!isUserMember) {
        throw new Error("Du bist kein Mitglied dieser Organisation");
    }
}

/**
 * Get the current user's role in the organization
 * Returns null if not a member
 */
export async function getUserRole(
    organizationId: number,
): Promise<OrganizationRoleType | null> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        const membership = await db
            .select({ role: organizationMembers.role })
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, currentUser.id),
                ),
            )
            .limit(1);

        if (!membership.length) {
            return null;
        }

        return membership[0].role as OrganizationRoleType;
    } catch {
        return null;
    }
}
