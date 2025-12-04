"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/modules/auth/shared/utils/auth-client";
import type {
    OrganizationMemberWithUser,
    OrganizationWithMemberCount,
} from "../../shared/models/organization.model";
import {
    getOrganizationMembers,
    getUserOrganizations,
} from "../../shared/organization.action";
import {
    getOrganizationInvitations,
    getMyPendingInvitations,
} from "../../shared/invitation.action";
import type { OrganizationInvitation } from "../../shared/schemas/invitation.schema";
import { AddMemberDialog } from "./add-member-dialog";
import { CreateOrganizationForm } from "./create-organization-form";
import { LeaveOrganizationButton } from "./leave-organization-button";
import { MembersList } from "./members-list";
import { OrganizationInvitationsList } from "../../shared/components/organization-invitations-list";
import { PendingInvitationsList } from "../../shared/components/pending-invitations-list";

export default function OrganizationSettingsPage() {
    const [organizations, setOrganizations] = useState<
        OrganizationWithMemberCount[]
    >([]);
    const [members, setMembers] = useState<OrganizationMemberWithUser[]>([]);
    const [invitations, setInvitations] = useState<OrganizationInvitation[]>(
        [],
    );
    const [myPendingInvitations, setMyPendingInvitations] = useState<
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
    >([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadOrganizations = useCallback(async () => {
        setIsLoading(true);
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);

        // Load current user
        const session = await authClient.getSession();
        const userId = session?.data?.user?.id;
        if (userId) {
            setCurrentUserId(userId);
        }

        // If no organization, load pending invitations for current user
        if (orgs.length === 0) {
            const pendingInvites = await getMyPendingInvitations();
            setMyPendingInvitations(pendingInvites);
        } else {
            // Load members if organization exists
            const orgMembers = await getOrganizationMembers(orgs[0].id);
            setMembers(orgMembers);

            // Load invitations if user is owner
            if (userId) {
                const currentMember = orgMembers.find(
                    (m) => m.userId === userId,
                );
                const isOwner = currentMember?.role === "owner";
                setIsCurrentUserOwner(isOwner);

                if (isOwner) {
                    const orgInvitations = await getOrganizationInvitations();
                    setInvitations(orgInvitations);
                }
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadOrganizations();
    }, [loadOrganizations]);

    if (isLoading) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <p>Lädt...</p>
            </div>
        );
    }

    // User has no organization - show creation form
    if (organizations.length === 0) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <div className="mb-8">
                    <Link href={dashboardRoutes.dashboard}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Zurück zum Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">
                        Organisationseinstellungen
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {myPendingInvitations.length > 0
                            ? "Nehmen Sie eine Einladung an oder erstellen Sie eine neue Organisation"
                            : "Erstelle deine Organisation, um loszulegen"}
                    </p>
                </div>

                <div className="space-y-6">
                    {myPendingInvitations.length > 0 && (
                        <PendingInvitationsList
                            invitations={myPendingInvitations}
                            onInvitationChange={loadOrganizations}
                        />
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Organisation erstellen</CardTitle>
                            <CardDescription>
                                Erstelle eine Organisation, um mit anderen
                                zusammenzuarbeiten.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateOrganizationForm
                                onSuccess={loadOrganizations}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // User has an organization
    const organization = organizations[0];

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <Link href={dashboardRoutes.dashboard}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zum Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">
                    Organisationseinstellungen
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{organization.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <span>
                                {organization.memberCount} Mitglied
                                {organization.memberCount !== 1 ? "er" : ""}
                            </span>
                            <span>•</span>
                            <span>
                                Erstellt am{" "}
                                {new Date(
                                    organization.createdAt,
                                ).toLocaleDateString("de-DE")}
                            </span>
                        </div>
                        <LeaveOrganizationButton
                            organizationId={organization.id}
                            organizationName={organization.name}
                            onSuccess={loadOrganizations}
                        />
                    </div>

                    {isCurrentUserOwner &&
                        members.length > 0 &&
                        currentUserId && (
                            <>
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">
                                            Mitglieder einladen
                                        </h3>
                                        <AddMemberDialog
                                            onSuccess={loadOrganizations}
                                        />
                                    </div>
                                    <OrganizationInvitationsList
                                        invitations={invitations}
                                        onInvitationsChange={loadOrganizations}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="text-lg font-semibold mb-4">
                                        Mitglieder
                                    </h3>
                                    <MembersList
                                        members={members}
                                        currentUserId={currentUserId}
                                        isCurrentUserOwner={isCurrentUserOwner}
                                        onRoleChange={loadOrganizations}
                                    />
                                </div>
                            </>
                        )}
                </CardContent>
            </Card>
        </div>
    );
}
