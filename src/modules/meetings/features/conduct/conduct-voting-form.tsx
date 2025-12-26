"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { createResolution } from "../../shared/resolution.action";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { MeetingParticipant } from "../../shared/schemas/meeting-participant.schema";
import { VoteChoice } from "../../shared/schemas/vote.schema";
import {
    calculateResolutionResult,
    castVotesBatch,
    getVotes,
} from "../../shared/vote.action";
import toast from "react-hot-toast";

interface ConductVotingFormProps {
    agendaItem: AgendaItem;
    participants: MeetingParticipant[];
    onComplete: () => void;
    isCompletingItem?: boolean;
}

export function ConductVotingForm({
    agendaItem,
    participants,
    onComplete,
    isCompletingItem = false,
}: ConductVotingFormProps) {
    const [votes, setVotes] = useState<Map<number, VoteChoice>>(new Map());
    const [resolutionId, setResolutionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Initialize resolution and load existing votes on mount
    useEffect(() => {
        async function initResolution() {
            setIsInitializing(true);
            // Reset votes when switching to a new agenda item
            setVotes(new Map());
            
            const result = await createResolution(agendaItem.id, {
                majorityType: agendaItem.majorityType || "simple",
            });

            if (result.success && result.data) {
                setResolutionId(result.data.id);

                // Load existing votes if any
                try {
                    const existingVotes = await getVotes(result.data.id);
                    if (existingVotes.length > 0) {
                        const votesMap = new Map<number, VoteChoice>();
                        for (const vote of existingVotes) {
                            votesMap.set(vote.participantId, vote.vote);
                        }
                        setVotes(votesMap);
                    }
                } catch (error) {
                    console.error("Error loading existing votes:", error);
                }
            }
            setIsInitializing(false);
        }

        initResolution();
    }, [agendaItem.id]);

    const handleVote = (participantId: number, vote: VoteChoice) => {
        setVotes((prev) => new Map(prev).set(participantId, vote));
    };

    const handleSubmit = async () => {
        if (!resolutionId) return;

        setIsSubmitting(true);

        try {
            // Cast all votes in a single batch to avoid N+1 problem
            const votesData = Array.from(votes.entries()).map(
                ([participantId, voteChoice]) => ({
                    participantId,
                    voteChoice,
                }),
            );

            const result = await castVotesBatch(resolutionId, votesData);

            if (result.success) {
                // Calculate result
                await calculateResolutionResult(resolutionId);

                // Mark as complete and move to next
                onComplete();
            } else {
                toast.error(result.error || "Fehler beim Speichern der Abstimmung");
            }
        } catch (error) {
            console.error("Error submitting votes:", error);
            toast.error("Fehler beim Speichern der Abstimmung");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate current totals (memoized to avoid recalculation on every render)
    const voteTotals = useMemo(() => {
        const yesShares = participants
            .filter((p) => votes.get(p.id) === VoteChoice.YES)
            .reduce((sum, p) => sum + p.shares, 0);

        const noShares = participants
            .filter((p) => votes.get(p.id) === VoteChoice.NO)
            .reduce((sum, p) => sum + p.shares, 0);

        const abstainShares = participants
            .filter((p) => votes.get(p.id) === VoteChoice.ABSTAIN)
            .reduce((sum, p) => sum + p.shares, 0);

        return { yesShares, noShares, abstainShares };
    }, [participants, votes]);

    const votedCount = votes.size;

    if (isInitializing) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-500">
                        Lade Abstimmung...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Abstimmung</CardTitle>
                <CardDescription>
                    Erfassen Sie die Stimmen aller anwesenden Teilnehmer
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Results */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Ja</div>
                        <div className="text-2xl font-bold text-green-600">
                            {voteTotals.yesShares} MEA
                        </div>
                        <div className="text-xs text-gray-500">
                            {
                                participants.filter(
                                    (p) => votes.get(p.id) === VoteChoice.YES,
                                ).length
                            }{" "}
                            Stimmen
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Nein</div>
                        <div className="text-2xl font-bold text-red-600">
                            {voteTotals.noShares} MEA
                        </div>
                        <div className="text-xs text-gray-500">
                            {
                                participants.filter(
                                    (p) => votes.get(p.id) === VoteChoice.NO,
                                ).length
                            }{" "}
                            Stimmen
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">
                            Enthaltung
                        </div>
                        <div className="text-2xl font-bold text-gray-600">
                            {voteTotals.abstainShares} MEA
                        </div>
                        <div className="text-xs text-gray-500">
                            {
                                participants.filter(
                                    (p) => votes.get(p.id) === VoteChoice.ABSTAIN,
                                ).length
                            }{" "}
                            Stimmen
                        </div>
                    </div>
                </div>

                {/* Voting Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teilnehmer</TableHead>
                            <TableHead>Einheit</TableHead>
                            <TableHead className="text-right">MEA</TableHead>
                            <TableHead className="text-center">Ja</TableHead>
                            <TableHead className="text-center">Nein</TableHead>
                            <TableHead className="text-center">
                                Enthaltung
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((participant) => (
                            <TableRow key={participant.id}>
                                <TableCell className="font-medium">
                                    {participant.ownerName}
                                </TableCell>
                                <TableCell>{participant.unitNumber}</TableCell>
                                <TableCell className="text-right font-semibold">
                                    {participant.shares}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        size="sm"
                                        variant={
                                            votes.get(participant.id) === VoteChoice.YES
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            handleVote(participant.id, VoteChoice.YES)
                                        }
                                        className="w-16"
                                    >
                                        {votes.get(participant.id) ===
                                            VoteChoice.YES && (
                                            <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Ja
                                    </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        size="sm"
                                        variant={
                                            votes.get(participant.id) === VoteChoice.NO
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            handleVote(participant.id, VoteChoice.NO)
                                        }
                                        className="w-16"
                                    >
                                        {votes.get(participant.id) === VoteChoice.NO && (
                                            <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Nein
                                    </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        size="sm"
                                        variant={
                                            votes.get(participant.id) ===
                                            VoteChoice.ABSTAIN
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            handleVote(
                                                participant.id,
                                                VoteChoice.ABSTAIN,
                                            )
                                        }
                                        className="w-24"
                                    >
                                        {votes.get(participant.id) ===
                                            VoteChoice.ABSTAIN && (
                                            <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Enthaltung
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                        {votedCount} von {participants.length} Teilnehmern haben
                        abgestimmt
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting || isCompletingItem || votedCount === 0
                        }
                        size="lg"
                    >
                        {isSubmitting || isCompletingItem
                            ? "Wird gespeichert..."
                            : "Abstimmung speichern"}
                        <Check className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
