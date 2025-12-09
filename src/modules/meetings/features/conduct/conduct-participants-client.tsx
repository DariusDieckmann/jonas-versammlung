"use client";

import { useRouter } from "next/navigation";
import conductRoutes from "../../shared/conduct.route";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";
import { ConductLayout } from "./conduct-layout";
import { ConductParticipantsForm } from "./conduct-participants-form";

interface ConductParticipantsClientProps {
    meeting: Meeting;
    participants: MeetingParticipant[];
}

export function ConductParticipantsClient({
    meeting,
    participants,
}: ConductParticipantsClientProps) {
    const router = useRouter();

    const handleFinish = () => {
        router.push(conductRoutes.agendaItems(meeting.id));
    };

    return (
        <ConductLayout
            meeting={meeting}
            currentStep={2}
            maxWidth="5xl"
            onNext={handleFinish}
            nextLabel="Weiter"
        >
            <ConductParticipantsForm initialParticipants={participants} />
        </ConductLayout>
    );
}
