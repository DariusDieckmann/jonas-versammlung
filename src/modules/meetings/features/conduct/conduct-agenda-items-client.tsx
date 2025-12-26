"use client";

import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { AgendaItemAttachment } from "../../shared/schemas/agenda-item-attachment.schema";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { MeetingAttachment } from "../../shared/schemas/meeting-attachment.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";
import { ConductAgendaItemsView } from "./conduct-agenda-items-view";
import { ConductLayout } from "./conduct-layout";

interface ConductAgendaItemsClientProps {
    meeting: Meeting;
    agendaItems: AgendaItem[];
    participants: MeetingParticipant[];
    completedAgendaItemIds: number[];
    meetingAttachments: MeetingAttachment[];
    agendaItemAttachments: Map<number, AgendaItemAttachment[]>;
}

export function ConductAgendaItemsClient({
    meeting,
    agendaItems,
    participants,
    completedAgendaItemIds,
    meetingAttachments,
    agendaItemAttachments,
}: ConductAgendaItemsClientProps) {
    return (
        <ConductLayout 
            meeting={meeting} 
            currentStep={3}
            meetingAttachments={meetingAttachments}
            agendaItemAttachments={agendaItemAttachments}
            agendaItems={agendaItems}
        >
            <ConductAgendaItemsView
                meetingId={meeting.id}
                agendaItems={agendaItems}
                participants={participants}
                completedAgendaItemIds={completedAgendaItemIds}
                agendaItemAttachments={agendaItemAttachments}
            />
        </ConductLayout>
    );
}
