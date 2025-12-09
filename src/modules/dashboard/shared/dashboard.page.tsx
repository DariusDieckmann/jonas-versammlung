import { Building, Building2, CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUpcomingOpenMeetings } from "@/modules/meetings/shared/meeting.action";
import meetingsRoutes from "@/modules/meetings/shared/meetings.route";

export default async function Dashboard() {
    const upcomingMeetings = await getUpcomingOpenMeetings();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("de-DE", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr;
    };
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Willkommen
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Verwalte deine Eigentümerversammlungen professionell und
                    effizient
                </p>
            </div>

            {/* Upcoming Meetings Section */}
            {upcomingMeetings.length > 0 && (
                <div className="mb-12 max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarDays className="h-6 w-6" />
                            Anstehende Versammlungen
                        </h2>
                        <Link href={meetingsRoutes.list}>
                            <Button variant="outline" size="sm">
                                Alle anzeigen
                            </Button>
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingMeetings.slice(0, 6).map((meeting) => (
                            <Link
                                key={meeting.id}
                                href={meetingsRoutes.detail(meeting.id)}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-2 mb-3">
                                                    <h3 className="text-base font-semibold line-clamp-2 flex-1">
                                                        {meeting.title}
                                                    </h3>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-800 shrink-0"
                                                    >
                                                        Geplant
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">
                                                            {
                                                                meeting.propertyName
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-4 w-4 shrink-0" />
                                                        <span>
                                                            {formatDate(
                                                                meeting.date,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 shrink-0" />
                                                        <span>
                                                            {formatTime(
                                                                meeting.startTime,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">
                                                            {
                                                                meeting.locationName
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Guide */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Navigation
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <Building className="mr-2 h-5 w-5" />
                                Liegenschaften
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Verwalte deine Immobilien mit allen Details wie
                                Adresse, Baujahr und Fläche. Lege Einheiten an
                                und ordne Eigentümer mit ihren MEA-Anteilen zu.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <CalendarDays className="mr-2 h-5 w-5" />
                                Versammlungen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Plane und führe Eigentümerversammlungen durch.
                                Erstelle Tagesordnungen, verwalte Teilnehmer und
                                führe Abstimmungen mit automatischer
                                Protokollierung durch.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <Building2 className="mr-2 h-5 w-5" />
                                Organisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Verwalte deine Organisation und lade
                                Teammitglieder ein. Lege Rollen fest (Owner oder
                                Member) und kontrolliere Zugriffsrechte.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
