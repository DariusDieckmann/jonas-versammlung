import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import conductRoutes from "../../shared/conduct.route";
import { getMeeting } from "../../shared/meeting.action";
import { getMeetingAttachments } from "../../shared/meeting-attachment.action";
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

    // Validate: Step 1 must be completed (leaders must be confirmed)
    if (!meeting.leadersConfirmedAt) {
        redirect(conductRoutes.leaders(meetingId));
    }

    // Get participants (created when meeting was started)
    const participants = await getMeetingParticipants(meetingId);

    // Get attachments for files sidebar
    const meetingAttachments = await getMeetingAttachments(meetingId);

    return (
        <ConductParticipantsClient
            meeting={meeting}
            participants={participants}
            meetingAttachments={meetingAttachments}
        />
    );
}
