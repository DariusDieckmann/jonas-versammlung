import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getMeetingLeaders } from "../../shared/meeting-leader.action";
import { ConductLayout } from "./conduct-layout";
import { ConductLeadersForm } from "./conduct-leaders-form";

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

    return (
        <ConductLayout meeting={meeting} currentStep={1} maxWidth="3xl">
            <ConductLeadersForm meetingId={meetingId} existingLeaders={existingLeaders} />
        </ConductLayout>
    );
}
