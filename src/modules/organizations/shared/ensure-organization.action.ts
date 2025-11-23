"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import type { AuthUser } from "@/modules/auth/shared/models/user.model";
import {
    organizationMembers,
    organizations,
} from "./schemas/organization.schema";
import { OrganizationRole } from "./models/organization.model";

/**
 * Ensures that a user has an organization.
 * If the user has no organization, creates a personal one automatically.
 * Returns the user's organization ID.
 */
export async function ensureUserHasOrganization(
    user: AuthUser,
): Promise<number> {
    const db = await getDb();

    // Check if user already has an organization
    const existingOrgs = await db
        .select({ organizationId: organizationMembers.organizationId })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, user.id))
        .limit(1);

    if (existingOrgs.length > 0) {
        return existingOrgs[0].organizationId;
    }

    // Create a personal organization for the user
    const newOrg = await db
        .insert(organizations)
        .values({
            name: `${user.name}'s Organization`,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .returning();

    if (!newOrg[0]) {
        throw new Error("Failed to create organization");
    }

    // Add user as owner of the organization
    await db.insert(organizationMembers).values({
        organizationId: newOrg[0].id,
        userId: user.id,
        role: OrganizationRole.OWNER,
        joinedAt: new Date().toISOString(),
    });

    return newOrg[0].id;
}
