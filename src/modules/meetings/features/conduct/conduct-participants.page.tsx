import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getMeetingParticipants } from "../../shared/meeting-participant.action";
import { ConductParticipantsClient } from "./conduct-participants-client";

interface ConductParticipantsPageProps {
    meetingId: number;
}

export default async function ConductParticipantsPage({
    meetingId,
}: ConductParticipantsPageProps) {
    await requireAuth();
    const meeting = await getMeeting(meetingId);

    if (!meeting) {
        notFound();
    }

    // Get participants (created when meeting was started)
    const participants = await getMeetingParticipants(meetingId);

    return (
        <ConductParticipantsClient
            meeting={meeting}
            participants={participants}
        />
    );
}
