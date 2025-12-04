"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Mail, Clock, User, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    acceptOrganizationInvitation,
    cancelOrganizationInvitation,
} from "../invitation.action";
import toast from "react-hot-toast";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";

interface PendingInvitation {
    id: number;
    invitationCode: string;
    organizationName: string;
    inviterName: string;
    inviterEmail: string;
    role: string;
    invitedAt: string;
    expiresAt: string;
}

interface PendingInvitationsListProps {
    invitations: PendingInvitation[];
    onInvitationChange: () => void;
}

export function PendingInvitationsList({
    invitations,
    onInvitationChange,
}: PendingInvitationsListProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleAccept = async (invitationCode: string, id: number) => {
        setProcessingId(id);
        const result = await acceptOrganizationInvitation(invitationCode);

        if (result.success) {
            toast.success(
                `Willkommen bei ${result.organizationName || "der Organisation"}!`,
            );
            // Redirect to dashboard
            router.push(dashboardRoutes.dashboard);
        } else {
            toast.error(result.error || "Fehler beim Annehmen der Einladung");
            setProcessingId(null);
            onInvitationChange();
        }
    };

    const handleDecline = async (id: number) => {
        if (!confirm("Möchten Sie diese Einladung wirklich ablehnen?")) {
            return;
        }

        setProcessingId(id);
        const result = await cancelOrganizationInvitation(id);

        if (result.success) {
            toast.success("Einladung wurde abgelehnt");
            onInvitationChange();
        } else {
            toast.error(result.error || "Fehler beim Ablehnen der Einladung");
        }
        setProcessingId(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diffMs = expires.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60),
        );

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        }
        return `${diffMinutes}m`;
    };

    if (invitations.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Ausstehende Einladungen
                </CardTitle>
                <CardDescription>
                    Sie wurden zu folgenden Organisationen eingeladen
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {invitations.map((invitation) => (
                        <div
                            key={invitation.id}
                            className="border rounded-lg p-4 space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600">
                                            Organisation
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {invitation.organizationName}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            invitation.role === "owner"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {invitation.role === "owner"
                                            ? "Eigentümer"
                                            : "Mitglied"}
                                    </Badge>
                                </div>

                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Eingeladen von
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {invitation.inviterName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {invitation.inviterEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t">
                                    <span>
                                        Gesendet: {formatDate(invitation.invitedAt)}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Läuft ab in:{" "}
                                        {getTimeRemaining(invitation.expiresAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={() =>
                                        handleAccept(
                                            invitation.invitationCode,
                                            invitation.id,
                                        )
                                    }
                                    disabled={processingId === invitation.id}
                                    className="flex-1"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Annehmen
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDecline(invitation.id)}
                                    disabled={processingId === invitation.id}
                                    className="flex-1"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Ablehnen
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
