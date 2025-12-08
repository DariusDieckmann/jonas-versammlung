"use client";

import {
    CalendarDays,
    Clock,
    LayoutGrid,
    MapPin,
    Plus,
    Table as TableIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Property } from "@/modules/properties/shared/schemas/property.schema";
import meetingsRoutes from "../../shared/meetings.route";
import type { Meeting } from "../../shared/schemas/meeting.schema";

interface MeetingsListProps {
    meetings: Meeting[];
    properties: Property[];
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

export function MeetingsList({ meetings, properties }: MeetingsListProps) {
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

    // Load view mode from localStorage on mount
    useEffect(() => {
        const savedViewMode = localStorage.getItem("meetings-view-mode");
        if (savedViewMode === "cards" || savedViewMode === "table") {
            setViewMode(savedViewMode);
        }
    }, []);

    // Save view mode to localStorage when it changes
    const handleViewModeChange = (mode: "cards" | "table") => {
        setViewMode(mode);
        localStorage.setItem("meetings-view-mode", mode);
    };

    // Create a map of property IDs to property names
    const propertyMap = new Map(properties.map((p) => [p.id, p]));

    if (meetings.length === 0) {
        return (
            <div className="text-center py-12">
                <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Keine Versammlungen
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    Erstelle deine erste Versammlung um zu beginnen
                </p>
                <div className="mt-6">
                    <Link href={meetingsRoutes.new}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Erste Versammlung erstellen
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr;
    };

    return (
        <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="inline-flex rounded-lg border p-1 bg-muted/50">
                    <Button
                        variant={viewMode === "cards" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("cards")}
                        className="gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("table")}
                        className="gap-2"
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Cards View */}
            {viewMode === "cards" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {meetings.map((meeting) => {
                        const property = propertyMap.get(meeting.propertyId);
                        return (
                            <Link
                                key={meeting.id}
                                href={meetingsRoutes.detail(meeting.id)}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="flex items-center gap-2 flex-1">
                                                <CalendarDays className="h-5 w-5 text-blue-600" />
                                                {meeting.title}
                                            </CardTitle>
                                            <Badge
                                                className={
                                                    statusColors[meeting.status]
                                                }
                                                variant="secondary"
                                            >
                                                {statusLabels[meeting.status]}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {property?.name ||
                                                "Unbekannte Liegenschaft"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                <span>
                                                    {formatDate(meeting.date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {formatTime(
                                                        meeting.startTime,
                                                    )}
                                                    {meeting.endTime &&
                                                        ` - ${formatTime(meeting.endTime)}`}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    {meeting.locationName}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titel</TableHead>
                                <TableHead>Liegenschaft</TableHead>
                                <TableHead>Datum</TableHead>
                                <TableHead>Uhrzeit</TableHead>
                                <TableHead>Ort</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meetings.map((meeting) => {
                                const property = propertyMap.get(
                                    meeting.propertyId,
                                );
                                return (
                                    <TableRow
                                        key={meeting.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => {
                                            window.location.href =
                                                meetingsRoutes.detail(
                                                    meeting.id,
                                                );
                                        }}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-blue-600" />
                                                {meeting.title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {property?.name ||
                                                "Unbekannte Liegenschaft"}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(meeting.date)}
                                        </TableCell>
                                        <TableCell>
                                            {formatTime(meeting.startTime)}
                                            {meeting.endTime &&
                                                ` - ${formatTime(meeting.endTime)}`}
                                        </TableCell>
                                        <TableCell>
                                            {meeting.locationName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    statusColors[meeting.status]
                                                }
                                                variant="secondary"
                                            >
                                                {statusLabels[meeting.status]}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
