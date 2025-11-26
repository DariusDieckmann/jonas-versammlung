import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getProperties } from "@/modules/properties/shared/property.action";
import { MeetingFormWithAgenda } from "../../shared/components/meeting-form-with-agenda";
import meetingsRoutes from "../../meetings.route";

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
            />
        </div>
    );
}
