import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { 
    getMeetingParticipants,
    createParticipantsFromOwners 
} from "../../shared/meeting-participant.action";
import meetingsRoutes from "../../meetings.route";
import conductRoutes from "../../conduct.route";
import { ConductParticipantsForm } from "./conduct-participants-form";

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
        <div className="container mx-auto py-8 px-4 max-w-5xl">
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
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                            2
                        </div>
                        <span className="font-medium">Teilnehmer prüfen</span>
                    </div>
                </div>
            </div>

            <ConductParticipantsForm
                meetingId={meetingId}
                initialParticipants={participants}
            />
        </div>
    );
}
