import {
    AlertCircle,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    Edit,
    FileText,
    MapPin,
    MinusCircle,
    Play,
    Trash2,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { replacePlaceholders } from "@/lib/placeholder-utils";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import propertiesRoutes from "@/modules/properties/shared/properties.route";
import { getProperty } from "@/modules/properties/shared/property.action";
import { getAgendaItems } from "../../shared/agenda-item.action";
import { getAgendaItemAttachmentsByItems } from "../../shared/agenda-item-attachment.action";
import conductRoutes from "../../shared/conduct.route";
import {
    deleteMeeting,
    getMeeting,
    startMeeting,
} from "../../shared/meeting.action";
import { getMeetingAttachments } from "../../shared/meeting-attachment.action";
import { getMeetingLeaders } from "../../shared/meeting-leader.action";
import { getMeetingParticipants } from "../../shared/meeting-participant.action";
import meetingsRoutes from "../../shared/meetings.route";
import { getResolutionsByAgendaItems } from "../../shared/resolution.action";
import { AgendaItemAttachments } from "./agenda-item-attachments";
import { BackToMeetingsButton } from "./back-to-meetings-button";
import { MeetingAttachmentsSection } from "./meeting-attachments-section";

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
    await requireAuth();
    const meeting = await getMeeting(meetingId);

    if (!meeting) {
        notFound();
    }

    // Get property information and agenda items
    const property = await getProperty(meeting.propertyId);
    const agendaItems = await getAgendaItems(meetingId);
    const attachments = await getMeetingAttachments(meetingId);

    // Get agenda item attachments
    const agendaItemAttachments = await getAgendaItemAttachmentsByItems(
        agendaItems.map((item) => item.id),
    );

    // Get resolutions if meeting is completed
    let resolutions = new Map();
    if (meeting.status === "completed") {
        const itemsWithResolutions = agendaItems.filter(
            (item) => item.requiresResolution,
        );
        resolutions = await getResolutionsByAgendaItems(
            itemsWithResolutions.map((item) => item.id),
        );
    }

    // Determine which step to resume to
    let resumeRoute = conductRoutes.leaders(meetingId);
    if (meeting.status === "in-progress") {
        const leaders = await getMeetingLeaders(meetingId);
        const participants = await getMeetingParticipants(meetingId);

        if (leaders.length > 0 && participants.length > 0) {
            // Both leaders and participants are done, go to agenda items
            resumeRoute = conductRoutes.agendaItems(meetingId);
        } else if (leaders.length > 0) {
            // Leaders are done, go to participants
            resumeRoute = conductRoutes.participants(meetingId);
        }
    }

    async function handleDelete() {
        "use server";
        const result = await deleteMeeting(meetingId);
        if (result.success) {
            redirect(meetingsRoutes.list);
        }
    }

    async function handleStart() {
        "use server";
        const result = await startMeeting(meetingId);
        if (result.success) {
            redirect(conductRoutes.leaders(meetingId));
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

    const formatDateTime = (dateTime: string | Date) => {
        const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
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
                <BackToMeetingsButton />

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
                            <Link
                                href={`${propertiesRoutes.detail(property.id)}?from=meeting&meetingId=${meetingId}`}
                            >
                                <div className="text-gray-600 hover:text-gray-900 transition-colors">
                                    <p className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        <span>
                                            {property.name}, {property.address},{" "}
                                            {property.postalCode}{" "}
                                            {property.city}
                                        </span>
                                    </p>
                                </div>
                            </Link>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {meeting.status === "planned" && (
                            <>
                                <form action={handleStart}>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        type="submit"
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        Starten
                                    </Button>
                                </form>
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
                            </>
                        )}
                        {meeting.status === "in-progress" && (
                            <>
                                <Link href={resumeRoute}>
                                    <Button variant="default" size="sm">
                                        <Play className="mr-2 h-4 w-4" />
                                        Fortsetzen
                                    </Button>
                                </Link>
                                <Link href={meetingsRoutes.edit(meeting.id)}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Bearbeiten
                                    </Button>
                                </Link>
                            </>
                        )}
                        {meeting.status === "completed" && (
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 px-4 py-2"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Versammlung abgeschlossen
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Datum, Uhrzeit & Ort */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datum, Uhrzeit & Ort</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Datum</span>
                                </div>
                                <div className="font-medium">
                                    {formatDate(meeting.date)}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Uhrzeit</span>
                                </div>
                                <div className="font-medium">
                                    {formatTime(meeting.startTime)}
                                    {meeting.endTime &&
                                        ` - ${formatTime(meeting.endTime)}`}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Einladungsfrist</span>
                                </div>
                                <div className="font-medium">
                                    {formatDateTime(meeting.invitationDeadline)}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>Ort</span>
                                </div>
                                <div className="font-medium">
                                    {meeting.locationName}
                                    {meeting.locationAddress &&
                                        `, ${meeting.locationAddress}`}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tagesordnung */}
                {agendaItems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Tagesordnung
                            </CardTitle>
                            <CardDescription>
                                {agendaItems.length}{" "}
                                {agendaItems.length === 1
                                    ? "Tagesordnungspunkt"
                                    : "Tagesordnungspunkte"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {agendaItems.map((item, index) => {
                                    const resolution = resolutions.get(item.id);
                                    const itemAttachments =
                                        agendaItemAttachments.get(item.id) ||
                                        [];

                                    return (
                                        <div
                                            key={item.id}
                                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-gray-500 min-w-[3rem]">
                                                        TOP {index + 1}
                                                    </span>
                                                    <h4 className="font-semibold text-lg">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                {item.requiresResolution && (
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Beschluss
                                                    </Badge>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="text-gray-600 text-sm whitespace-pre-wrap ml-[3.75rem] mb-3">
                                                    {replacePlaceholders(
                                                        item.description,
                                                        meeting,
                                                    )}
                                                </p>
                                            )}

                                            {/* Agenda Item Attachments */}
                                            {(itemAttachments.length > 0 ||
                                                meeting.status !==
                                                    "completed") && (
                                                <div className="ml-[3.75rem] mb-3">
                                                    <AgendaItemAttachments
                                                        agendaItemId={item.id}
                                                        attachments={
                                                            itemAttachments
                                                        }
                                                        canEdit={
                                                            meeting.status !==
                                                            "completed"
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {/* Show resolution results if completed */}
                                            {meeting.status === "completed" &&
                                                item.requiresResolution &&
                                                resolution && (
                                                    <div className="ml-[3.75rem] mt-3 pt-3 border-t">
                                                        <h5 className="font-semibold text-sm mb-3">
                                                            Abstimmungsergebnis
                                                        </h5>
                                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                                            <div className="text-center p-2 bg-green-50 rounded">
                                                                <div className="text-xl font-bold text-green-600">
                                                                    {
                                                                        resolution.votesYes
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    Ja-Stimmen
                                                                </div>
                                                                {resolution.yesShares && (
                                                                    <div className="text-xs font-semibold text-green-700 mt-1">
                                                                        {
                                                                            resolution.yesShares
                                                                        }{" "}
                                                                        MEA
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-center p-2 bg-red-50 rounded">
                                                                <div className="text-xl font-bold text-red-600">
                                                                    {
                                                                        resolution.votesNo
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    Nein-Stimmen
                                                                </div>
                                                                {resolution.noShares && (
                                                                    <div className="text-xs font-semibold text-red-700 mt-1">
                                                                        {
                                                                            resolution.noShares
                                                                        }{" "}
                                                                        MEA
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                                <div className="text-xl font-bold text-gray-600">
                                                                    {
                                                                        resolution.votesAbstain
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    Enthaltungen
                                                                </div>
                                                                {resolution.abstainShares && (
                                                                    <div className="text-xs font-semibold text-gray-700 mt-1">
                                                                        {
                                                                            resolution.abstainShares
                                                                        }{" "}
                                                                        MEA
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {resolution.result && (
                                                            <div
                                                                className={`flex items-center gap-2 p-2 rounded text-sm ${
                                                                    resolution.result ===
                                                                    "accepted"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : resolution.result ===
                                                                            "rejected"
                                                                          ? "bg-red-100 text-red-800"
                                                                          : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {resolution.result ===
                                                                "accepted" ? (
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                ) : resolution.result ===
                                                                  "rejected" ? (
                                                                    <XCircle className="h-4 w-4" />
                                                                ) : (
                                                                    <MinusCircle className="h-4 w-4" />
                                                                )}
                                                                <span className="font-semibold">
                                                                    {resolution.result ===
                                                                    "accepted"
                                                                        ? "Angenommen"
                                                                        : resolution.result ===
                                                                            "rejected"
                                                                          ? "Abgelehnt"
                                                                          : "Verschoben"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Attachments */}
                <MeetingAttachmentsSection
                    meetingId={meetingId}
                    attachments={attachments}
                    canEdit={meeting.status !== "completed"}
                />

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
