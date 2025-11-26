import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getProperties } from "@/modules/properties/shared/property.action";
import { MeetingForm } from "../../shared/components/meeting-form";
import meetingsRoutes from "../../meetings.route";

export default async function NewMeetingPage() {
    await requireAuth();
    const properties = await getProperties();

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href={meetingsRoutes.list}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Neue Versammlung</h1>
                <p className="text-gray-600 mt-1">
                    Plane eine neue Eigentümerversammlung
                </p>
            </div>

            <MeetingForm properties={properties} />
        </div>
    );
}
