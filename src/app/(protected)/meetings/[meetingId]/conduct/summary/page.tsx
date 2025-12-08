import { notFound } from "next/navigation";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { ConductSummaryClient } from "@/modules/meetings/features/conduct/conduct-summary-client";
import { getAgendaItems } from "@/modules/meetings/shared/agenda-item.action";
import { getMeeting } from "@/modules/meetings/shared/meeting.action";
import { getResolutionsByAgendaItems } from "@/modules/meetings/shared/resolution.action";
import { replacePlaceholders } from "@/lib/placeholder-utils";

interface ConductSummaryPageProps {
    params: Promise<{ meetingId: string }>;
}

export default async function ConductSummaryRoute({
    params,
}: ConductSummaryPageProps) {
    const { meetingId } = await params;
    const id = Number.parseInt(meetingId, 10);

    await requireAuth();
    const meeting = await getMeeting(id);

    if (!meeting) {
        notFound();
    }

    const agendaItems = await getAgendaItems(id);
    // Platzhalter replace
    const agendaItemsWithResolvedPlaceholders = agendaItems.map((item) => ({
        ...item,
        description: item.description
            ? replacePlaceholders(item.description, meeting)
            : null,
    }));

    // Get resolutions for agenda items that require them
    const itemsWithResolutions = agendaItems.filter(
        (item) => item.requiresResolution,
    );
    const resolutions = await getResolutionsByAgendaItems(
        itemsWithResolutions.map((item) => item.id),
    );

    return (
        <ConductSummaryClient
            meeting={meeting}
            agendaItems={agendaItemsWithResolvedPlaceholders}
            resolutions={resolutions}
        />
    );
}
