import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getProperties } from "@/modules/properties/shared/property.action";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import { getAgendaItemTemplates } from "../../shared/agenda-item-template.action";
import type { AgendaItemTemplate } from "../../shared/schemas/agenda-item-template.schema";
import meetingsRoutes from "../../shared/meetings.route";
import { MeetingFormWithAgenda } from "../../shared/components/meeting-form-with-agenda";

export default async function NewMeetingPage() {
    await requireAuth();
    const properties = await getProperties();

    // Load templates for organization
    let templates: AgendaItemTemplate[] = [];
    const organizations = await getUserOrganizations();
    if (organizations.length > 0) {
        templates = await getAgendaItemTemplates(organizations[0].id);
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-4">
                <Link href={meetingsRoutes.list}>
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
                    </Button>
                </Link>
            </div>

            <MeetingFormWithAgenda
                properties={properties}
                templates={templates}
            />
        </div>
    );
}
