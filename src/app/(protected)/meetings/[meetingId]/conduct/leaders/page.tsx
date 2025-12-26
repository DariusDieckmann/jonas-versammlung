import ConductLeadersPage from "@/modules/meetings/features/conduct/conduct-leaders.page";

export default async function ConductLeadersRoute({
    params,
}: {
    params: Promise<{ meetingId: string }>;
}) {
    const { meetingId } = await params;
    return <ConductLeadersPage meetingId={parseInt(meetingId, 10)} />;
}
