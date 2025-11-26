import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getMeetingParticipants } from "../../shared/meeting-participant.action";
import { ConductLayout } from "./conduct-layout";
import { ConductAgendaItemsView } from "./conduct-agenda-items-view";

interface ConductAgendaItemsPageProps {
    meetingId: number;
}

export default async function ConductAgendaItemsPage({
    meetingId,
}: ConductAgendaItemsPageProps) {
    await requireAuth();
    const meeting = await getMeeting(meetingId);

    if (!meeting) {
        notFound();
    }

    const agendaItems = await getAgendaItems(meetingId);
    const participants = await getMeetingParticipants(meetingId);

    return (
        <ConductLayout meeting={meeting} currentStep={3}>
            <ConductAgendaItemsView
                meetingId={meetingId}
                agendaItems={agendaItems}
                participants={participants}
            />
        </ConductLayout>
    );
}
