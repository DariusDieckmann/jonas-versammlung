"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { getAgendaItemTemplates } from "@/modules/meetings/shared/agenda-item-template.action";
import { AgendaItemTemplatesManager } from "@/modules/meetings/shared/components/agenda-item-templates-manager";
import meetingsRoutes from "@/modules/meetings/shared/meetings.route";
import type { AgendaItemTemplate } from "@/modules/meetings/shared/schemas/agenda-item-template.schema";
import type { OrganizationWithMemberCount } from "@/modules/organizations/shared/models/organization.model";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";

export default function AgendaItemTemplatesPage() {
    const [organization, setOrganization] =
        useState<OrganizationWithMemberCount | null>(null);
    const [templates, setTemplates] = useState<AgendaItemTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const orgs = await getUserOrganizations();
            if (orgs.length > 0) {
                setOrganization(orgs[0]);
                const templateList = await getAgendaItemTemplates(orgs[0].id);
                setTemplates(templateList);
            }
        } catch (error) {
            console.error("Error loading templates:", error);
            toast.error("Fehler beim Laden der Vorlagen");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <p>Lädt...</p>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <p className="text-gray-600">
                    Sie müssen einer Organisation angehören, um Vorlagen zu
                    verwalten.
                </p>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <Link href={meetingsRoutes.list}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zu Versammlungen
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">TOP-Vorlagen</h1>
                <p className="text-gray-600 mt-1">
                    Verwalten Sie Vorlagen für Tagesordnungspunkte
                </p>
            </div>

            <AgendaItemTemplatesManager
                organizationId={organization.id}
                templates={templates}
                onTemplatesChange={loadData}
            />
        </div>
    );
}
