import ConductParticipantsPage from "@/modules/meetings/features/conduct/conduct-participants.page";

export default async function Page({
    params,
}: {
    params: Promise<{ meetingId: string }>;
}) {
    const { meetingId } = await params;
    return <ConductParticipantsPage meetingId={parseInt(meetingId, 10)} />;
}
