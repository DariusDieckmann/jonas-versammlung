"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";
import { ConductVotingForm } from "./conduct-voting-form";
import meetingsRoutes from "../../meetings.route";

interface ConductAgendaItemsViewProps {
    meetingId: number;
    agendaItems: AgendaItem[];
    participants: MeetingParticipant[];
}

export function ConductAgendaItemsView({
    meetingId,
    agendaItems,
    participants,
}: ConductAgendaItemsViewProps) {
    const router = useRouter();
    const [selectedItemId, setSelectedItemId] = useState<number | null>(
        agendaItems.length > 0 ? agendaItems[0].id : null
    );
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

    const selectedItem = agendaItems.find(item => item.id === selectedItemId);

    const handleItemComplete = (itemId: number) => {
        setCompletedItems(prev => new Set([...prev, itemId]));
        
        // Move to next item
        const currentIndex = agendaItems.findIndex(item => item.id === itemId);
        if (currentIndex < agendaItems.length - 1) {
            setSelectedItemId(agendaItems[currentIndex + 1].id);
        } else {
            // All items done - return to meeting detail
            router.push(meetingsRoutes.detail(meetingId));
        }
    };

    if (agendaItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Keine Tagesordnungspunkte</CardTitle>
                    <CardDescription>
                        Für diese Versammlung wurden noch keine Tagesordnungspunkte angelegt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        onClick={() => router.push(meetingsRoutes.detail(meetingId))}
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
                            {agendaItems.length} {agendaItems.length === 1 ? "Punkt" : "Punkte"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {agendaItems.map((item, index) => (
                                <button
                                    key={item.id}
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
                                                    <Badge variant="outline" className="text-xs">
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
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary">
                                                TOP {agendaItems.findIndex(i => i.id === selectedItem.id) + 1}
                                            </Badge>
                                            {selectedItem.requiresResolution && (
                                                <Badge variant="default">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Beschluss erforderlich
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl">{selectedItem.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            {selectedItem.description && (
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {selectedItem.description}
                                        </p>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {selectedItem.requiresResolution ? (
                            <ConductVotingForm
                                agendaItem={selectedItem}
                                participants={participants}
                                onComplete={() => handleItemComplete(selectedItem.id)}
                            />
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-gray-600 mb-4">
                                        Dieser Tagesordnungspunkt erfordert keine Abstimmung.
                                    </p>
                                    <Button onClick={() => handleItemComplete(selectedItem.id)}>
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
