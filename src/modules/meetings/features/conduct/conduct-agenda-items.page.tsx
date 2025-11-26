import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getMeetingParticipants } from "../../shared/meeting-participant.action";
import { getResolutionsByAgendaItems } from "../../shared/resolution.action";
import { ConductAgendaItemsClient } from "./conduct-agenda-items-client";

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
    
    // Load existing resolutions to mark completed items
    const agendaItemIds = agendaItems.map(item => item.id);
    const resolutionsMap = await getResolutionsByAgendaItems(agendaItemIds);
    
    // Convert Map to array of agenda item IDs that have resolutions
    const completedAgendaItemIds = Array.from(resolutionsMap.keys());

    return (
        <ConductAgendaItemsClient 
            meeting={meeting}
            agendaItems={agendaItems}
            participants={participants}
            completedAgendaItemIds={completedAgendaItemIds}
        />
    );
}
