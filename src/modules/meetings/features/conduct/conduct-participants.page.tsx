import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { 
    getMeetingParticipants,
    createParticipantsFromOwners 
} from "../../shared/meeting-participant.action";
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

    // Get or create participants automatically
    let participants = await getMeetingParticipants(meetingId);
    
    // If no participants exist, create them automatically
    if (participants.length === 0) {
        const result = await createParticipantsFromOwners(meetingId);
        if (result.success) {
            // Fetch the newly created participants
            participants = await getMeetingParticipants(meetingId);
        } else {
            // If creation fails (e.g., no owners), redirect back with error
            // For now, we'll show empty state which will display the error
            participants = [];
        }
    }

    return (
        <ConductParticipantsClient meeting={meeting} participants={participants} />
    );
}
