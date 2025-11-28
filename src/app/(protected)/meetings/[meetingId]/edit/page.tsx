import MeetingEditPage from "@/modules/meetings/features/edit/meeting-edit.page";

interface PageProps {
    params: Promise<{ meetingId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { meetingId } = await params;
    return <MeetingEditPage meetingId={parseInt(meetingId, 10)} />;
}
