import { notFound, redirect } from "next/navigation";
import { replacePlaceholders } from "@/lib/placeholder-utils";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import conductRoutes from "../../shared/conduct.route";
import { getAgendaItemAttachmentsByItems } from "../../shared/agenda-item-attachment.action";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getMeeting } from "../../shared/meeting.action";
import { getMeetingAttachments } from "../../shared/meeting-attachment.action";
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

    // Validate: Step 1 must be completed (leaders must be confirmed)
    if (!meeting.leadersConfirmedAt) {
        redirect(conductRoutes.leaders(meetingId));
    }

    // Validate: Step 2 must be completed (participants must be confirmed)
    if (!meeting.participantsConfirmedAt) {
        redirect(conductRoutes.participants(meetingId));
    }

    // Optimization: Fetch all independent data in parallel
    const [participants, agendaItems, meetingAttachments] = await Promise.all([
        getMeetingParticipants(meetingId),
        getAgendaItems(meetingId),
        getMeetingAttachments(meetingId),
    ]);

    // Replace placeholders in agenda item descriptions only (not titles)
    const agendaItemsWithResolvedPlaceholders = agendaItems.map((item) => ({
        ...item,
        description: item.description
            ? replacePlaceholders(item.description, meeting)
            : null,
    }));

    // Load existing resolutions to mark completed items
    const agendaItemIds = agendaItems.map((item) => item.id);

    // Optimization: Fetch resolutions and attachments in parallel (they depend on agendaItemIds)
    const [resolutionsMap, agendaItemAttachments] = await Promise.all([
        getResolutionsByAgendaItems(agendaItemIds),
        getAgendaItemAttachmentsByItems(agendaItemIds),
    ]);

    // Only include agenda items with resolutions that have a result (actual votes were cast)
    const completedAgendaItemIds = Array.from(resolutionsMap.entries())
        .filter(([_, resolution]) => resolution.result !== null)
        .map(([agendaItemId]) => agendaItemId);


    return (
        <ConductAgendaItemsClient
            meeting={meeting}
            agendaItems={agendaItemsWithResolvedPlaceholders}
            participants={participants}
            completedAgendaItemIds={completedAgendaItemIds}
            meetingAttachments={meetingAttachments}
            agendaItemAttachments={agendaItemAttachments}
        />
    );
}
