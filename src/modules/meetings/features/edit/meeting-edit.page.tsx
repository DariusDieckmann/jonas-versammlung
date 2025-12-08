import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getProperties } from "@/modules/properties/shared/property.action";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import meetingsRoutes from "../../shared/meetings.route";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getAgendaItemTemplates } from "../../shared/agenda-item-template.action";
import type { AgendaItemTemplate } from "../../shared/schemas/agenda-item-template.schema";
import { MeetingFormWithAgenda } from "../../shared/components/meeting-form-with-agenda";
import { getMeeting } from "../../shared/meeting.action";

interface MeetingEditPageProps {
    meetingId: number;
}

export default async function MeetingEditPage({
    meetingId,
}: MeetingEditPageProps) {
    await requireAuth();
    const meeting = await getMeeting(meetingId);
    const properties = await getProperties();

    if (!meeting) {
        notFound();
    }

    const agendaItems = await getAgendaItems(meetingId);

    // Load templates for organization
    let templates: AgendaItemTemplate[] = [];
    const organizations = await getUserOrganizations();
    if (organizations.length > 0) {
        templates = await getAgendaItemTemplates(organizations[0].id);
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-4">
                <Link href={meetingsRoutes.detail(meetingId)}>
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Versammlung
                    </Button>
                </Link>
            </div>

            <MeetingFormWithAgenda
                properties={properties}
                initialData={meeting}
                initialAgendaItems={agendaItems}
                templates={templates}
            />
        </div>
    );
}
