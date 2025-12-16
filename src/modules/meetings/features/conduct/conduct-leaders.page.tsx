import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getMeetingAttachments } from "../../shared/meeting-attachment.action";
import { getMeetingLeaders } from "../../shared/meeting-leader.action";
import { ConductLeadersClient } from "./conduct-leaders-client";

interface ConductLeadersPageProps {
    meetingId: number;
}

export default async function ConductLeadersPage({
    meetingId,
}: ConductLeadersPageProps) {
    await requireAuth();
    const meeting = await getMeeting(meetingId);

    if (!meeting) {
        notFound();
    }

    // Get existing leaders
    const existingLeaders = await getMeetingLeaders(meetingId);

    // Get attachments for files sidebar
    const meetingAttachments = await getMeetingAttachments(meetingId);

    return (
        <ConductLeadersClient
            meeting={meeting}
            existingLeaders={existingLeaders}
            meetingAttachments={meetingAttachments}
        />
    );
}
