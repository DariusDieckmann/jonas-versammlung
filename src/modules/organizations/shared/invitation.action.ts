"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { sendEmail } from "@/services/email.service";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";
import { getUserOrganizations } from "./organization.action";
import { requireOwner } from "./organization-permissions.action";
import {
    organizationInvitations,
    type NewOrganizationInvitation,
    insertOrganizationInvitationSchema,
} from "./schemas/invitation.schema";
import { organizationMembers, organizations } from "./schemas/organization.schema";
import { OrganizationRole, type OrganizationRoleType } from "./models/organization.model";
import { user } from "@/modules/auth/shared/schemas/auth.schema";
import settingsRoutes from "./settings.route";

/**
 * Generate a secure random invitation code
 */
function generateInvitationCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 32; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Create and send an organization invitation
 */
export async function inviteOrganizationMember(
    email: string,
    role: OrganizationRoleType = OrganizationRole.MEMBER,
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Get user's organization
        const userOrgs = await getUserOrganizations();
        if (userOrgs.length === 0) {
            return {
                success: false,
                error: "Sie gehören zu keiner Organisation",
            };
        }

        const organizationId = userOrgs[0].id;
        const organization = userOrgs[0];
        await requireOwner(organizationId);

        // Check if user with this email already exists and is a member
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            const existingMembership = await db
                .select()
                .from(organizationMembers)
                .where(
                    and(
                        eq(organizationMembers.organizationId, organizationId),
                        eq(organizationMembers.userId, existingUser[0].id),
                    ),
                )
                .limit(1);

            if (existingMembership.length > 0) {
                return {
                    success: false,
                    error: "Benutzer ist bereits Mitglied dieser Organisation",
                };
            }
        }

        // Check if there's already a pending invitation for this email
        const now = new Date().toISOString();
        const pendingInvitation = await db
            .select()
            .from(organizationInvitations)
            .where(
                and(
                    eq(organizationInvitations.organizationId, organizationId),
                    eq(organizationInvitations.email, email),
                    gt(organizationInvitations.expiresAt, now),
                    isNull(organizationInvitations.acceptedAt),
                ),
            )
            .limit(1);

        if (pendingInvitation.length > 0) {
            return {
                success: false,
                error: "Es gibt bereits eine ausstehende Einladung für diese E-Mail",
            };
        }

        // Generate invitation code and expiry (24 hours)
        const invitationCode = generateInvitationCode();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Validate input
        const validatedData = insertOrganizationInvitationSchema.parse({
            organizationId,
            email,
            invitationCode,
            role,
            invitedBy: currentUser.id,
            invitedAt: now,
            expiresAt,
        });

        // Create invitation
        await db
            .insert(organizationInvitations)
            .values(validatedData as NewOrganizationInvitation);

        // Send invitation email
        const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invitationCode}`;
        
        await sendEmail({
            to: email,
            subject: `Einladung zur Organisation "${organization.name}"`,
            html: `
                <h2>Sie wurden eingeladen!</h2>
                <p>${currentUser.name || currentUser.email} hat Sie eingeladen, der Organisation <strong>${organization.name}</strong> beizutreten.</p>
                <p>Ihre Rolle: <strong>${role === "owner" ? "Eigentümer" : "Mitglied"}</strong></p>
                <p>Diese Einladung ist 24 Stunden gültig.</p>
                <p>
                    <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
                        Einladung annehmen
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    Oder kopieren Sie diesen Link: ${invitationUrl}
                </p>
            `,
        });

        revalidatePath(settingsRoutes.organization);
        return { success: true };
    } catch (error) {
        console.error("Error inviting organization member:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Versenden der Einladung",
        };
    }
}

/**
 * Get invitation details by code (for display before accepting)
 */
export async function getInvitationDetails(invitationCode: string): Promise<{
    success: boolean;
    error?: string;
    invitation?: {
        organizationName: string;
        inviterName: string;
        inviterEmail: string;
        role: string;
        expiresAt: string;
    };
}> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Find the invitation with organization and inviter details
        const now = new Date().toISOString();
        const result = await db
            .select({
                invitation: organizationInvitations,
                organization: organizations,
                inviter: user,
            })
            .from(organizationInvitations)
            .innerJoin(
                organizations,
                eq(organizationInvitations.organizationId, organizations.id),
            )
            .innerJoin(
                user,
                eq(organizationInvitations.invitedBy, user.id),
            )
            .where(eq(organizationInvitations.invitationCode, invitationCode))
            .limit(1);

        if (!result.length) {
            return {
                success: false,
                error: "Einladung nicht gefunden",
            };
        }

        const { invitation, organization, inviter } = result[0];

        // Check if invitation is for the current user's email
        if (invitation.email !== currentUser.email) {
            return {
                success: false,
                error: "Diese Einladung ist für eine andere E-Mail-Adresse bestimmt",
            };
        }

        // Check if expired
        if (invitation.expiresAt < now) {
            return {
                success: false,
                error: "Diese Einladung ist abgelaufen",
            };
        }

        // Check if already accepted
        if (invitation.acceptedAt) {
            return {
                success: false,
                error: "Diese Einladung wurde bereits verwendet",
            };
        }

        return {
            success: true,
            invitation: {
                organizationName: organization.name,
                inviterName: inviter.name || inviter.email,
                inviterEmail: inviter.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt,
            },
        };
    } catch (error) {
        console.error("Error getting invitation details:", error);
        return {
            success: false,
            error: "Fehler beim Laden der Einladungsdetails",
        };
    }
}

/**
 * Accept an organization invitation
 */
export async function acceptOrganizationInvitation(
    invitationCode: string,
): Promise<{ success: boolean; error?: string; organizationName?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Find the invitation
        const now = new Date().toISOString();
        const invitation = await db
            .select()
            .from(organizationInvitations)
            .where(eq(organizationInvitations.invitationCode, invitationCode))
            .limit(1);

        if (!invitation.length) {
            return {
                success: false,
                error: "Einladung nicht gefunden",
            };
        }

        const inv = invitation[0];

        // Check if already accepted
        if (inv.acceptedAt) {
            return {
                success: false,
                error: "Diese Einladung wurde bereits verwendet",
            };
        }

        // Check if expired
        if (inv.expiresAt < now) {
            return {
                success: false,
                error: "Diese Einladung ist abgelaufen",
            };
        }

        // Check if email matches current user
        if (inv.email !== currentUser.email) {
            return {
                success: false,
                error: "Diese Einladung ist für eine andere E-Mail-Adresse bestimmt",
            };
        }

        // Check if user is already a member
        const existingMembership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, inv.organizationId),
                    eq(organizationMembers.userId, currentUser.id),
                ),
            )
            .limit(1);

        if (existingMembership.length > 0) {
            return {
                success: false,
                error: "Sie sind bereits Mitglied dieser Organisation",
            };
        }

        // Get organization name for success message
        const org = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, inv.organizationId))
            .limit(1);

        // Add user as member
        await db.insert(organizationMembers).values({
            organizationId: inv.organizationId,
            userId: currentUser.id,
            role: inv.role,
        });

        // Mark invitation as accepted
        await db
            .update(organizationInvitations)
            .set({ acceptedAt: now })
            .where(eq(organizationInvitations.id, inv.id));

        revalidatePath(dashboardRoutes.dashboard);
        return {
            success: true,
            organizationName: org[0]?.name || "Organisation",
        };
    } catch (error) {
        console.error("Error accepting invitation:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Fehler beim Annehmen der Einladung",
        };
    }
}

/**
 * Get all pending invitations for an organization
 */
export async function getOrganizationInvitations() {
    const currentUser = await requireAuth();
    const db = await getDb();

    // Get user's organization
    const userOrgs = await getUserOrganizations();
    if (userOrgs.length === 0) {
        return [];
    }

    const organizationId = userOrgs[0].id;
    await requireOwner(organizationId);

    // Get pending invitations (not expired, not accepted)
    const now = new Date().toISOString();
    const invitations = await db
        .select()
        .from(organizationInvitations)
        .where(
            and(
                eq(organizationInvitations.organizationId, organizationId),
                gt(organizationInvitations.expiresAt, now),
                isNull(organizationInvitations.acceptedAt),
            ),
        )
        .orderBy(organizationInvitations.invitedAt);

    return invitations;
}

/**
 * Get all pending invitations for the current user
 */
export async function getMyPendingInvitations(): Promise<
    Array<{
        id: number;
        invitationCode: string;
        organizationName: string;
        inviterName: string;
        inviterEmail: string;
        role: string;
        invitedAt: string;
        expiresAt: string;
    }>
> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        const now = new Date().toISOString();

        // Get all pending invitations for current user's email
        const results = await db
            .select({
                invitation: organizationInvitations,
                organization: organizations,
                inviter: user,
            })
            .from(organizationInvitations)
            .innerJoin(
                organizations,
                eq(organizationInvitations.organizationId, organizations.id),
            )
            .innerJoin(user, eq(organizationInvitations.invitedBy, user.id))
            .where(
                and(
                    eq(organizationInvitations.email, currentUser.email),
                    gt(organizationInvitations.expiresAt, now),
                    isNull(organizationInvitations.acceptedAt),
                ),
            )
            .orderBy(organizationInvitations.invitedAt);

        return results.map(({ invitation, organization, inviter }) => ({
            id: invitation.id,
            invitationCode: invitation.invitationCode,
            organizationName: organization.name,
            inviterName: inviter.name || inviter.email,
            inviterEmail: inviter.email,
            role: invitation.role,
            invitedAt: invitation.invitedAt,
            expiresAt: invitation.expiresAt,
        }));
    } catch (error) {
        console.error("Error getting pending invitations:", error);
        return [];
    }
}

/**
 * Cancel/delete an invitation
 * Can be called by: 1) Organization owner (to cancel sent invitations)
 *                   2) Invited user (to decline received invitations)
 */
export async function cancelOrganizationInvitation(
    invitationId: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        const db = await getDb();

        // Get the invitation
        const invitation = await db
            .select()
            .from(organizationInvitations)
            .where(eq(organizationInvitations.id, invitationId))
            .limit(1);

        if (!invitation.length) {
            return {
                success: false,
                error: "Einladung nicht gefunden",
            };
        }

        const inv = invitation[0];

        // Check if user is either the invited person or an owner of the organization
        const isInvitedUser = inv.email === currentUser.email;
        let isOwner = false;

        if (!isInvitedUser) {
            // Check if user is owner of the organization
            const userOrgs = await getUserOrganizations();
            if (
                userOrgs.length > 0 &&
                userOrgs[0].id === inv.organizationId
            ) {
                try {
                    await requireOwner(inv.organizationId);
                    isOwner = true;
                } catch {
                    isOwner = false;
                }
            }
        }

        if (!isInvitedUser && !isOwner) {
            return {
                success: false,
                error: "Keine Berechtigung",
            };
        }

        // Delete invitation
        await db
            .delete(organizationInvitations)
            .where(eq(organizationInvitations.id, invitationId));

        revalidatePath(settingsRoutes.organization);
        return { success: true };
    } catch (error) {
        console.error("Error canceling invitation:", error);
        return {
            success: false,
            error: "Fehler beim Abbrechen der Einladung",
        };
    }
}
