"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Building2, User } from "lucide-react";
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
    getInvitationDetails,
} from "@/modules/organizations/shared/invitation.action";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";

interface InvitePageProps {
    invitationCode: string;
}

export function InvitePage({ invitationCode }: InvitePageProps) {
    const router = useRouter();
    const [state, setState] = useState<
        "loading" | "success" | "error" | "ready" | "loadingDetails"
    >("loadingDetails");
    const [message, setMessage] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [invitationDetails, setInvitationDetails] = useState<{
        organizationName: string;
        inviterName: string;
        inviterEmail: string;
        role: string;
        expiresAt: string;
    } | null>(null);

    useEffect(() => {
        const loadDetails = async () => {
            const result = await getInvitationDetails(invitationCode);

            if (result.success && result.invitation) {
                setInvitationDetails(result.invitation);
                setState("ready");
            } else {
                setState("error");
                setMessage(
                    result.error || "Fehler beim Laden der Einladung",
                );
            }
        };

        loadDetails();
    }, [invitationCode]);

    const handleAccept = async () => {
        setState("loading");
        const result = await acceptOrganizationInvitation(invitationCode);

        if (result.success) {
            setState("success");
            setOrganizationName(result.organizationName || "");
            setMessage(
                `Sie sind nun Mitglied der Organisation "${result.organizationName}"`,
            );
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push(dashboardRoutes.dashboard);
            }, 2000);
        } else {
            setState("error");
            setMessage(result.error || "Fehler beim Annehmen der Einladung");
        }
    };

    if (state === "loading" || state === "loadingDetails") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <p className="text-gray-600">
                                {state === "loadingDetails"
                                    ? "Einladung wird geladen..."
                                    : "Einladung wird verarbeitet..."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (state === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <h2 className="text-xl font-semibold">
                                Willkommen!
                            </h2>
                            <p className="text-center text-gray-600">
                                {message}
                            </p>
                            <p className="text-sm text-gray-500">
                                Sie werden zum Dashboard weitergeleitet...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (state === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <XCircle className="h-12 w-12 text-red-500" />
                            <h2 className="text-xl font-semibold">
                                Fehler
                            </h2>
                            <p className="text-center text-gray-600">
                                {message}
                            </p>
                            <Button
                                onClick={() => router.push(dashboardRoutes.dashboard)}
                                variant="outline"
                            >
                                Zum Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Einladung zur Organisation</CardTitle>
                    <CardDescription>
                        Sie wurden eingeladen, einer Organisation beizutreten
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {invitationDetails && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Organisation
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {invitationDetails.organizationName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Eingeladen von
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {invitationDetails.inviterName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {invitationDetails.inviterEmail}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        Ihre Rolle
                                    </p>
                                    <Badge
                                        variant={
                                            invitationDetails.role === "owner"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {invitationDetails.role === "owner"
                                            ? "Eigentümer"
                                            : "Mitglied"}
                                    </Badge>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 text-center">
                                Diese Einladung läuft ab am{" "}
                                {new Date(
                                    invitationDetails.expiresAt,
                                ).toLocaleString("de-DE", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    )}

                    <Button onClick={handleAccept} className="w-full">
                        Einladung annehmen
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
