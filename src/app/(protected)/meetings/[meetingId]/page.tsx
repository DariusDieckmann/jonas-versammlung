import MeetingDetailPage from "@/modules/meetings/features/detail/meeting-detail.page";

interface PageProps {
    params: Promise<{ meetingId: string }>;
}

export default async function MeetingDetailRoute({ params }: PageProps) {
    const { meetingId } = await params;
    return <MeetingDetailPage meetingId={parseInt(meetingId, 10)} />;
}
