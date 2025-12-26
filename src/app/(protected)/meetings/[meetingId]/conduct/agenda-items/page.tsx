import ConductAgendaItemsPage from "@/modules/meetings/features/conduct/conduct-agenda-items.page";

export default async function ConductAgendaItemsRoute({
    params,
}: {
    params: Promise<{ meetingId: string }>;
}) {
    const { meetingId } = await params;
    return (
        <ConductAgendaItemsPage meetingId={Number.parseInt(meetingId, 10)} />
    );
}
