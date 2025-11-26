import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getMeetingParticipants } from "../../shared/meeting-participant.action";
import meetingsRoutes from "../../meetings.route";
import { ConductAgendaItemsView } from "./conduct-agenda-items-view";

interface ConductAgendaItemsPageProps {
    meetingId: number;
}

export default async function ConductAgendaItemsPage({
    meetingId,
}: ConductAgendaItemsPageProps) {
    await requireAuth();
    const meeting = await getMeeting(meetingId);

    if (!meeting) {
        notFound();
    }

    const agendaItems = await getAgendaItems(meetingId);
    const participants = await getMeetingParticipants(meetingId);

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-6">
                <Link href={meetingsRoutes.detail(meetingId)}>
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Versammlung
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Versammlung durchführen</h1>
                <p className="text-gray-600 mt-1">{meeting.title}</p>
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                            ✓
                        </div>
                        <span>Leiter festgelegt</span>
                    </div>
                    <div className="h-px w-8 bg-gray-300" />
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                            ✓
                        </div>
                        <span>Teilnehmer geprüft</span>
                    </div>
                    <div className="h-px w-8 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                            3
                        </div>
                        <span className="font-medium">Tagesordnung</span>
                    </div>
                </div>
            </div>

            <ConductAgendaItemsView
                meetingId={meetingId}
                agendaItems={agendaItems}
                participants={participants}
            />
        </div>
    );
}
