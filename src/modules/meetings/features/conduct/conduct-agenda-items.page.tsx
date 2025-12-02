import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getMeeting } from "../../shared/meeting.action";
import { getMeetingParticipants } from "../../shared/meeting-participant.action";
import { getResolutionsByAgendaItems } from "../../shared/resolution.action";
import { ConductAgendaItemsClient } from "./conduct-agenda-items-client";
import { replacePlaceholders } from "@/lib/placeholder-utils";

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

    // Replace placeholders in agenda item descriptions only (not titles)
    const agendaItemsWithResolvedPlaceholders = agendaItems.map((item) => ({
        ...item,
        description: item.description
            ? replacePlaceholders(item.description, meeting)
            : null,
    }));

    // Load existing resolutions to mark completed items
    const agendaItemIds = agendaItems.map((item) => item.id);
    const resolutionsMap = await getResolutionsByAgendaItems(agendaItemIds);

    // Convert Map to array of agenda item IDs that have resolutions
    const completedAgendaItemIds = Array.from(resolutionsMap.keys());

    return (
        <ConductAgendaItemsClient
            meeting={meeting}
            agendaItems={agendaItemsWithResolvedPlaceholders}
            participants={participants}
            completedAgendaItemIds={completedAgendaItemIds}
        />
    );
}
