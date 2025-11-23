"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getUserOrganizations } from "../../shared/organization.action";
import type { OrganizationWithMemberCount } from "../../shared/models/organization.model";
import { CreateOrganizationForm } from "./create-organization-form";
import { LeaveOrganizationButton } from "./leave-organization-button";

export default function OrganizationSettingsPage() {
    const [organizations, setOrganizations] = useState<OrganizationWithMemberCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadOrganizations = async () => {
        setIsLoading(true);
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);
        setIsLoading(false);
    };

    useEffect(() => {
        loadOrganizations();
    }, []);

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
                    <Link href="/dashboard">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Zurück zum Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">
                        Organisationseinstellungen
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Erstelle deine Organisation, um loszulegen
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Organisation erstellen</CardTitle>
                        <CardDescription>
                            Erstelle eine Organisation, um Todos zu verwalten und
                            mit anderen zusammenzuarbeiten.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateOrganizationForm onSuccess={loadOrganizations} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User has an organization
    const organization = organizations[0];

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zum Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Organisationseinstellungen</h1>
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
                </CardContent>
            </Card>
        </div>
    );
}
