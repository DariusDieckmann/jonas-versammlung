"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ConductLayout } from "./conduct-layout";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { Resolution } from "../../shared/schemas/resolution.schema";
import { completeMeeting } from "../../shared/meeting.action";
import meetingsRoutes from "../../meetings.route";

interface ConductSummaryClientProps {
    meeting: Meeting;
    agendaItems: AgendaItem[];
    resolutions: Map<number, Resolution>;
}

export function ConductSummaryClient({ meeting, agendaItems, resolutions }: ConductSummaryClientProps) {
    const router = useRouter();
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = async () => {
        setIsCompleting(true);
        
        const result = await completeMeeting(meeting.id);
        
        if (result.success) {
            router.push(meetingsRoutes.detail(meeting.id));
        } else {
            alert(result.error || "Fehler beim Abschließen der Versammlung");
            setIsCompleting(false);
        }
    };

    return (
        <ConductLayout 
            meeting={meeting} 
            currentStep={4}
            maxWidth="5xl"
            onNext={handleComplete}
            nextLabel={isCompleting ? "Wird abgeschlossen..." : "Versammlung abschließen"}
            nextDisabled={isCompleting}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Zusammenfassung</CardTitle>
                        <CardDescription>
                            Überprüfen Sie die Ergebnisse der Versammlung bevor Sie abschließen
                        </CardDescription>
                    </CardHeader>
                </Card>

                {agendaItems.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-gray-500 text-center">
                                Keine Tagesordnungspunkte vorhanden
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {agendaItems.map((item, index) => (
                            <Card key={item.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">
                                                    TOP {index + 1}
                                                </Badge>
                                                {item.requiresResolution && (
                                                    <Badge variant="secondary">
                                                        Abstimmung
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl">
                                                {item.title}
                                            </CardTitle>
                                            {item.description && (
                                                <CardDescription className="mt-2">
                                                    {item.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                {item.requiresResolution && (
                                    <CardContent>
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-3">Abstimmungsergebnis</h4>
                                            {resolutions.has(item.id) ? (
                                                (() => {
                                                    const resolution = resolutions.get(item.id)!;
                                                    const totalVotes = resolution.votesYes + resolution.votesNo + resolution.votesAbstain;
                                                    
                                                    return (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                                    <div className="text-2xl font-bold text-green-600">
                                                                        {resolution.votesYes}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 mt-1">Ja-Stimmen</div>
                                                                    {resolution.yesShares && (
                                                                        <div className="text-sm font-semibold text-green-700 mt-1">
                                                                            {resolution.yesShares} MEA
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                                                    <div className="text-2xl font-bold text-red-600">
                                                                        {resolution.votesNo}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 mt-1">Nein-Stimmen</div>
                                                                    {resolution.noShares && (
                                                                        <div className="text-sm font-semibold text-red-700 mt-1">
                                                                            {resolution.noShares} MEA
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                                    <div className="text-2xl font-bold text-gray-600">
                                                                        {resolution.votesAbstain}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 mt-1">Enthaltungen</div>
                                                                    {resolution.abstainShares && (
                                                                        <div className="text-sm font-semibold text-gray-700 mt-1">
                                                                            {resolution.abstainShares} MEA
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {resolution.result && (
                                                                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                                                                    resolution.result === "accepted" 
                                                                        ? "bg-green-100 text-green-800" 
                                                                        : resolution.result === "rejected"
                                                                            ? "bg-red-100 text-red-800"
                                                                            : "bg-gray-100 text-gray-800"
                                                                }`}>
                                                                    {resolution.result === "accepted" ? (
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    ) : resolution.result === "rejected" ? (
                                                                        <XCircle className="h-5 w-5" />
                                                                    ) : (
                                                                        <MinusCircle className="h-5 w-5" />
                                                                    )}
                                                                    <span className="font-semibold">
                                                                        {resolution.result === "accepted" 
                                                                            ? "Angenommen" 
                                                                            : resolution.result === "rejected"
                                                                                ? "Abgelehnt"
                                                                                : "Verschoben"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    Keine Abstimmung durchgeführt
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ConductLayout>
    );
}
