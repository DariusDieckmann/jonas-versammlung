"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { acceptOrganizationInvitation } from "@/modules/organizations/shared/invitation.action";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";

interface InvitePageProps {
    invitationCode: string;
}

export function InvitePage({ invitationCode }: InvitePageProps) {
    const router = useRouter();
    const [state, setState] = useState<
        "loading" | "success" | "error" | "ready"
    >("ready");
    const [message, setMessage] = useState("");
    const [organizationName, setOrganizationName] = useState("");

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

    if (state === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <p className="text-gray-600">
                                Einladung wird verarbeitet...
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
                <CardContent className="space-y-4">
                    <p className="text-gray-600">
                        Klicken Sie auf den Button unten, um die Einladung
                        anzunehmen und der Organisation beizutreten.
                    </p>
                    <Button onClick={handleAccept} className="w-full">
                        Einladung annehmen
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
