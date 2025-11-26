import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Edit,
    MapPin,
    Trash2,
    Building2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { deleteMeeting, getMeeting } from "../../shared/meeting.action";
import { getProperty } from "@/modules/properties/shared/property.action";
import meetingsRoutes from "../../meetings.route";
import propertiesRoutes from "@/modules/properties/properties.route";

interface MeetingDetailPageProps {
    meetingId: number;
}

const statusColors = {
    planned: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
};

const statusLabels = {
    planned: "Geplant",
    "in-progress": "Laufend",
    completed: "Abgeschlossen",
};

export default async function MeetingDetailPage({
    meetingId,
}: MeetingDetailPageProps) {
    const user = await requireAuth();
    const meeting = await getMeeting(meetingId);

    if (!meeting) {
        notFound();
    }

    // Get property information
    const property = await getProperty(meeting.propertyId);

    async function handleDelete() {
        "use server";
        const result = await deleteMeeting(meetingId);
        if (result.success) {
            redirect(meetingsRoutes.list);
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr;
    };

    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <Link href={meetingsRoutes.list}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <CalendarDays className="h-8 w-8" />
                                {meeting.title}
                            </h1>
                            <Badge
                                className={statusColors[meeting.status]}
                                variant="secondary"
                            >
                                {statusLabels[meeting.status]}
                            </Badge>
                        </div>
                        {property && (
                            <Link href={propertiesRoutes.detail(property.id)}>
                                <p className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {property.name}
                                </p>
                            </Link>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Link href={meetingsRoutes.edit(meeting.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                            </Button>
                        </Link>
                        <form action={handleDelete}>
                            <Button
                                variant="destructive"
                                size="sm"
                                type="submit"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Datum & Uhrzeit */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datum & Uhrzeit</CardTitle>
                        <CardDescription>
                            Wann findet die Versammlung statt
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Datum</span>
                                </div>
                                <div className="text-lg font-medium">
                                    {formatDate(meeting.date)}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Uhrzeit</span>
                                </div>
                                <div className="text-lg font-medium">
                                    {formatTime(meeting.startTime)}
                                    {meeting.endTime &&
                                        ` - ${formatTime(meeting.endTime)}`}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Einladungsfrist</span>
                                </div>
                                <div className="text-lg font-medium">
                                    {formatDateTime(meeting.invitationDeadline)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Veranstaltungsort */}
                <Card>
                    <CardHeader>
                        <CardTitle>Veranstaltungsort</CardTitle>
                        <CardDescription>
                            Wo findet die Versammlung statt
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <MapPin className="h-4 w-4" />
                                <span>Ort</span>
                            </div>
                            <div className="text-lg font-medium">
                                {meeting.locationName}
                            </div>
                        </div>

                        {meeting.locationAddress && (
                            <>
                                <Separator />
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">
                                        Adresse
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {meeting.locationAddress}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Liegenschaft */}
                {property && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Liegenschaft</CardTitle>
                            <CardDescription>
                                Zugehörige Immobilie
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={propertiesRoutes.detail(property.id)}>
                                <div className="hover:bg-gray-50 p-4 rounded-lg transition-colors border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-lg">
                                            {property.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {property.street} {property.houseNumber}
                                            , {property.postalCode} {property.city}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Metadaten */}
                <Card>
                    <CardHeader>
                        <CardTitle>Metadaten</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Erstellt:</span>
                                <br />
                                {formatDateTime(meeting.createdAt)}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Zuletzt aktualisiert:
                                </span>
                                <br />
                                {formatDateTime(meeting.updatedAt)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
