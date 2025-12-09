"use client";

import { CheckCircle2, Circle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAgendaItem } from "../../shared/agenda-item.action";
import conductRoutes from "../../shared/conduct.route";
import meetingsRoutes from "../../shared/meetings.route";
import { markAgendaItemCompleted } from "../../shared/resolution.action";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";
import { ConductVotingForm } from "./conduct-voting-form";

interface ConductAgendaItemsViewProps {
    meetingId: number;
    agendaItems: AgendaItem[];
    participants: MeetingParticipant[];
    completedAgendaItemIds: number[];
}

export function ConductAgendaItemsView({
    meetingId,
    agendaItems,
    participants,
    completedAgendaItemIds,
}: ConductAgendaItemsViewProps) {
    const router = useRouter();
    const [selectedItemId, setSelectedItemId] = useState<number | null>(
        agendaItems.length > 0 ? agendaItems[0].id : null,
    );

    // Initialize completedItems from existing resolutions
    const [completedItems, setCompletedItems] = useState<Set<number>>(() => {
        return new Set(completedAgendaItemIds);
    });

    // Track edited values for each item
    const [editedItems, setEditedItems] = useState<
        Map<number, { title: string; description: string }>
    >(
        new Map(
            agendaItems.map((item) => [
                item.id,
                { title: item.title, description: item.description || "" },
            ]),
        ),
    );

    // Update completed items when completedAgendaItemIds changes (e.g., after navigation back)
    useEffect(() => {
        setCompletedItems(new Set(completedAgendaItemIds));
    }, [completedAgendaItemIds]);

    // Filter only present and represented participants for voting
    const votingParticipants = participants.filter(
        (p) =>
            p.attendanceStatus === "present" ||
            p.attendanceStatus === "represented",
    );

    const selectedItem = agendaItems.find((item) => item.id === selectedItemId);
    const editedData = selectedItemId ? editedItems.get(selectedItemId) : null;

    const handleTitleChange = (itemId: number, title: string) => {
        setEditedItems((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(itemId) || {
                title: "",
                description: "",
            };
            newMap.set(itemId, { ...current, title });
            return newMap;
        });
    };

    const handleDescriptionChange = (itemId: number, description: string) => {
        setEditedItems((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(itemId) || {
                title: "",
                description: "",
            };
            newMap.set(itemId, { ...current, description });
            return newMap;
        });
    };

    const handleItemComplete = async (itemId: number) => {
        // Save changes before completing
        const edited = editedItems.get(itemId);
        const originalItem = agendaItems.find((i) => i.id === itemId);

        if (edited && originalItem) {
            const hasChanges =
                edited.title !== originalItem.title ||
                edited.description !== (originalItem.description || "");

            if (hasChanges) {
                await updateAgendaItem(itemId, {
                    title: edited.title,
                    description: edited.description || null,
                });
            }
        }

        // For items without voting, mark as completed in DB
        const item = agendaItems.find((i) => i.id === itemId);
        if (item && !item.requiresResolution) {
            const result = await markAgendaItemCompleted(itemId);
            if (!result.success) {
                alert(result.error || "Fehler beim Markieren als erledigt");
                return;
            }
        }

        setCompletedItems((prev) => new Set([...prev, itemId]));

        // Move to next item
        const currentIndex = agendaItems.findIndex(
            (item) => item.id === itemId,
        );
        if (currentIndex < agendaItems.length - 1) {
            setSelectedItemId(agendaItems[currentIndex + 1].id);
        } else {
            // All items done - go to summary page
            router.push(conductRoutes.summary(meetingId));
        }
    };

    if (agendaItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Keine Tagesordnungspunkte</CardTitle>
                    <CardDescription>
                        Für diese Versammlung wurden noch keine
                        Tagesordnungspunkte angelegt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.push(meetingsRoutes.detail(meetingId))
                        }
                    >
                        Zurück zur Versammlung
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Left: Agenda Items List */}
            <div className="col-span-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Tagesordnung</CardTitle>
                        <CardDescription>
                            {agendaItems.length}{" "}
                            {agendaItems.length === 1 ? "Punkt" : "Punkte"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {agendaItems.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedItemId(item.id)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                        selectedItemId === item.id
                                            ? "bg-blue-50 border-l-4 border-blue-500"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {completedItems.has(item.id) ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-gray-500">
                                                    TOP {index + 1}
                                                </span>
                                                {item.requiresResolution && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Beschluss
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="font-medium text-sm line-clamp-2">
                                                {item.title}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Selected Item Detail */}
            <div className="col-span-8">
                {selectedItem ? (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary">
                                        TOP{" "}
                                        {agendaItems.findIndex(
                                            (i) => i.id === selectedItem.id,
                                        ) + 1}
                                    </Badge>
                                    {selectedItem.requiresResolution && (
                                        <Badge variant="default">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Beschluss erforderlich
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="title"
                                        className="text-sm font-medium mb-2"
                                    >
                                        Titel
                                    </Label>
                                    <Input
                                        id="title"
                                        value={editedData?.title || ""}
                                        onChange={(e) =>
                                            handleTitleChange(
                                                selectedItem.id,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Titel des Tagesordnungspunkts"
                                        className="text-lg font-semibold"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="description"
                                        className="text-sm font-medium mb-2"
                                    >
                                        Beschreibung (optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={editedData?.description || ""}
                                        onChange={(e) =>
                                            handleDescriptionChange(
                                                selectedItem.id,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Zusätzliche Informationen..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {selectedItem.requiresResolution ? (
                            <ConductVotingForm
                                agendaItem={selectedItem}
                                participants={votingParticipants}
                                onComplete={() =>
                                    handleItemComplete(selectedItem.id)
                                }
                            />
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-gray-600 mb-4">
                                        Dieser Tagesordnungspunkt erfordert
                                        keine Abstimmung.
                                    </p>
                                    <Button
                                        onClick={() =>
                                            handleItemComplete(selectedItem.id)
                                        }
                                    >
                                        Als erledigt markieren
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-center text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Wählen Sie einen Tagesordnungspunkt aus</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
