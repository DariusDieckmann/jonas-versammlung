import { CalendarDays, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getProperties } from "@/modules/properties/shared/property.action";
import settingsRoutes from "@/modules/organizations/shared/settings.route";
import meetingsRoutes from "../../shared/meetings.route";
import { getMeetings } from "../../shared/meeting.action";
import { MeetingsList } from "./meetings-list";

export default async function MeetingsListPage() {
    await requireAuth();
    const meetings = await getMeetings();
    const properties = await getProperties();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CalendarDays className="h-8 w-8" />
                        Versammlungen
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Verwalte Eigentümerversammlungen
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={settingsRoutes.templates}>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            TOP-Vorlagen
                        </Button>
                    </Link>
                    {meetings.length > 0 && (
                        <Link href={meetingsRoutes.new}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Neue Versammlung
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <MeetingsList meetings={meetings} properties={properties} />
        </div>
    );
}
