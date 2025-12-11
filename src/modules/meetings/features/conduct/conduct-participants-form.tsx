"use client";

import { UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { updateMeetingParticipant } from "../../shared/meeting-participant.action";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";

interface ConductParticipantsFormProps {
    initialParticipants: MeetingParticipant[];
}

export function ConductParticipantsForm({
    initialParticipants,
}: ConductParticipantsFormProps) {
    const router = useRouter();
    const [participants, setParticipants] =
        useState<MeetingParticipant[]>(initialParticipants);
    
    // Debounce timer for representation updates
    const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});
    const pendingUpdates = useRef<Record<number, string | null>>({});

    // Cleanup: flush all pending updates before component unmounts
    useEffect(() => {
        return () => {
            // Clear all timers and execute pending updates immediately
            Object.keys(debounceTimers.current).forEach((key) => {
                const participantId = Number(key);
                if (debounceTimers.current[participantId]) {
                    clearTimeout(debounceTimers.current[participantId]);
                }
                
                // Execute pending update if exists
                if (pendingUpdates.current[participantId] !== undefined) {
                    updateMeetingParticipant(participantId, {
                        representedBy: pendingUpdates.current[participantId],
                    });
                }
            });
        };
    }, []);

    const handleUpdateAttendance = async (
        participantId: number,
        attendanceStatus: "present" | "represented" | "absent",
    ) => {
        // Optimistic update
        setParticipants((prev) =>
            prev.map((p) =>
                p.id === participantId ? { ...p, attendanceStatus } : p,
            ),
        );

        const result = await updateMeetingParticipant(participantId, {
            attendanceStatus,
        });

        if (!result.success) {
            // Revert on error
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === participantId
                        ? {
                              ...p,
                              attendanceStatus:
                                  initialParticipants.find(
                                      (ip) => ip.id === participantId,
                                  )?.attendanceStatus || "absent",
                          }
                        : p,
                ),
            );
        }
    };

    const handleUpdateRepresentation = useCallback(
        (participantId: number, representedBy: string | null) => {
            // Immediate optimistic update for UI responsiveness
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === participantId ? { ...p, representedBy } : p,
                ),
            );

            // Store pending update
            pendingUpdates.current[participantId] = representedBy || null;

            // Clear existing timer for this participant
            if (debounceTimers.current[participantId]) {
                clearTimeout(debounceTimers.current[participantId]);
            }

            // Set new timer to save after user stops typing
            debounceTimers.current[participantId] = setTimeout(async () => {
                const result = await updateMeetingParticipant(participantId, {
                    representedBy: representedBy || null,
                });

                // Clear pending update after successful save
                delete pendingUpdates.current[participantId];
                delete debounceTimers.current[participantId];

                if (!result.success) {
                    // Revert on error
                    setParticipants((prev) =>
                        prev.map((p) =>
                            p.id === participantId
                                ? {
                                      ...p,
                                      representedBy:
                                          initialParticipants.find(
                                              (ip) => ip.id === participantId,
                                          )?.representedBy || null,
                                  }
                                : p,
                        ),
                    );
                }
            }, 500); // Wait 500ms after user stops typing
        },
        [],
    );

    const totalShares = participants.reduce((sum, p) => sum + p.shares, 0);
    const presentShares = participants
        .filter(
            (p) =>
                p.attendanceStatus === "present" ||
                p.attendanceStatus === "represented",
        )
        .reduce((sum, p) => sum + p.shares, 0);
    const quorumPercentage =
        totalShares > 0 ? (presentShares / totalShares) * 100 : 0;

    if (participants.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Teilnehmer prüfen</CardTitle>
                    <CardDescription>
                        Es konnten keine Teilnehmer geladen werden
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">
                            Für diese Versammlung wurden keine Eigentümer
                            gefunden. Bitte stellen Sie sicher, dass für die
                            Liegenschaft Einheiten mit Eigentümern angelegt
                            sind.
                        </p>
                        <Button variant="outline" onClick={() => router.back()}>
                            Zurück
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Teilnehmer prüfen</CardTitle>
                <CardDescription>
                    Markieren Sie anwesende Teilnehmer und tragen Sie Vertreter
                    ein
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-blue-900">
                                Anwesenheit
                            </p>
                            <p className="text-sm text-blue-700">
                                {
                                    participants.filter(
                                        (p) =>
                                            p.attendanceStatus === "present" ||
                                            p.attendanceStatus ===
                                                "represented",
                                    ).length
                                }{" "}
                                von {participants.length} Teilnehmer
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-blue-900">
                                Anteile
                            </p>
                            <p className="text-sm text-blue-700">
                                {presentShares} / {totalShares} (
                                {quorumPercentage.toFixed(1)}%)
                            </p>
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Einheit</TableHead>
                            <TableHead className="text-right">
                                Anteile
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                                Anwesend
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                                Vertreten
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                                Abwesend
                            </TableHead>
                            <TableHead>Vertreten durch</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((participant) => (
                            <TableRow key={participant.id}>
                                <TableCell className="font-medium">
                                    {participant.ownerName}
                                </TableCell>
                                <TableCell>{participant.unitNumber}</TableCell>
                                <TableCell className="text-right">
                                    {participant.shares}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={
                                            participant.attendanceStatus ===
                                            "present"
                                        }
                                        onCheckedChange={() => {
                                            handleUpdateAttendance(
                                                participant.id,
                                                "present",
                                            );
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={
                                            participant.attendanceStatus ===
                                            "represented"
                                        }
                                        onCheckedChange={() => {
                                            handleUpdateAttendance(
                                                participant.id,
                                                "represented",
                                            );
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={
                                            participant.attendanceStatus ===
                                            "absent"
                                        }
                                        onCheckedChange={() => {
                                            handleUpdateAttendance(
                                                participant.id,
                                                "absent",
                                            );
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Name des Vertreters"
                                        value={participant.representedBy || ""}
                                        onChange={(e) =>
                                            handleUpdateRepresentation(
                                                participant.id,
                                                e.target.value || null,
                                            )
                                        }
                                        disabled={
                                            participant.attendanceStatus !==
                                            "represented"
                                        }
                                        className="max-w-xs"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
