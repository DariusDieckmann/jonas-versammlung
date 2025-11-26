import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getMeeting } from "../../shared/meeting.action";
import { getProperties } from "@/modules/properties/shared/property.action";
import { MeetingForm } from "../../shared/components/meeting-form";
import meetingsRoutes from "../../meetings.route";

interface MeetingEditPageProps {
    meetingId: number;
}

export default async function MeetingEditPage({
    meetingId,
}: MeetingEditPageProps) {
    await requireAuth();
    const meeting = await getMeeting(meetingId);
    const properties = await getProperties();

    if (!meeting) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href={meetingsRoutes.detail(meetingId)}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Versammlung
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Versammlung bearbeiten</h1>
                <p className="text-gray-600 mt-1">
                    Aktualisiere die Details der Versammlung
                </p>
            </div>

            <MeetingForm properties={properties} initialData={meeting} />
        </div>
    );
}
