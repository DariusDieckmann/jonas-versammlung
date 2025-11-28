"use client";

import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";
import { ConductAgendaItemsView } from "./conduct-agenda-items-view";
import { ConductLayout } from "./conduct-layout";

interface ConductAgendaItemsClientProps {
    meeting: Meeting;
    agendaItems: AgendaItem[];
    participants: MeetingParticipant[];
    completedAgendaItemIds: number[];
}

export function ConductAgendaItemsClient({
    meeting,
    agendaItems,
    participants,
    completedAgendaItemIds,
}: ConductAgendaItemsClientProps) {
    return (
        <ConductLayout meeting={meeting} currentStep={3}>
            <ConductAgendaItemsView
                meetingId={meeting.id}
                agendaItems={agendaItems}
                participants={participants}
                completedAgendaItemIds={completedAgendaItemIds}
            />
        </ConductLayout>
    );
}
