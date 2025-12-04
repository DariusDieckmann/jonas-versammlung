"use client";

import { useState } from "react";
import { Mail, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrganizationInvitation } from "../schemas/invitation.schema";
import { cancelOrganizationInvitation } from "../invitation.action";
import toast from "react-hot-toast";

interface OrganizationInvitationsListProps {
    invitations: OrganizationInvitation[];
    onInvitationsChange: () => void;
}

export function OrganizationInvitationsList({
    invitations,
    onInvitationsChange,
}: OrganizationInvitationsListProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleCancel = async (invitationId: number) => {
        setDeletingId(invitationId);
        const result = await cancelOrganizationInvitation(invitationId);

        if (result.success) {
            toast.success("Einladung wurde abgebrochen");
            onInvitationsChange();
        } else {
            toast.error(result.error || "Fehler beim Abbrechen der Einladung");
        }
        setDeletingId(null);
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
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-500">
                        Keine ausstehenden Einladungen
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Ausstehende Einladungen
                </CardTitle>
                <CardDescription>
                    Einladungen sind 24 Stunden gültig
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {invitations.map((invitation) => (
                        <div
                            key={invitation.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">
                                        {invitation.email}
                                    </p>
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
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>
                                        Gesendet: {formatDate(invitation.invitedAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Läuft ab in:{" "}
                                        {getTimeRemaining(invitation.expiresAt)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(invitation.id)}
                                disabled={deletingId === invitation.id}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
