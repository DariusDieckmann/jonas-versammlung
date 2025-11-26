"use client";

import { ConductLayout } from "./conduct-layout";
import { ConductAgendaItemsView } from "./conduct-agenda-items-view";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";

interface ConductAgendaItemsClientProps {
    meeting: Meeting;
    agendaItems: AgendaItem[];
    participants: MeetingParticipant[];
}

export function ConductAgendaItemsClient({ 
    meeting, 
    agendaItems, 
    participants 
}: ConductAgendaItemsClientProps) {
    return (
        <ConductLayout 
            meeting={meeting} 
            currentStep={3}
        >
            <ConductAgendaItemsView
                meetingId={meeting.id}
                agendaItems={agendaItems}
                participants={participants}
            />
        </ConductLayout>
    );
}
