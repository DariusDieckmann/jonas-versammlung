"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createMeetingLeaders, deleteMeetingLeaders } from "../../shared/meeting-leader.action";
import type { MeetingLeader } from "../../shared/schemas/meeting-leader.schema";
import conductRoutes from "../../conduct.route";

interface LeaderFormData {
    name: string;
    role: string;
}

interface ConductLeadersFormProps {
    meetingId: number;
    existingLeaders: MeetingLeader[];
}

const LEADER_ROLES = [
    { value: "Versammlungsleiter", label: "Versammlungsleiter" },
    { value: "Protokollführer", label: "Protokollführer" },
    { value: "Stimmzähler", label: "Stimmzähler" },
    { value: "Sonstiges", label: "Sonstiges" },
];

export function ConductLeadersForm({ meetingId, existingLeaders }: ConductLeadersFormProps) {
    const router = useRouter();
    
    // Initialize with existing leaders or default empty leader
    const initialLeaders: LeaderFormData[] = existingLeaders.length > 0
        ? existingLeaders.map(leader => ({
            name: leader.name,
            role: leader.role || "Versammlungsleiter",
        }))
        : [{ name: "", role: "Versammlungsleiter" }];
    
    const [leaders, setLeaders] = useState<LeaderFormData[]>(initialLeaders);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addLeader = () => {
        setLeaders([...leaders, { name: "", role: "Protokollführer" }]);
    };

    const removeLeader = (index: number) => {
        if (leaders.length > 1) {
            setLeaders(leaders.filter((_, i) => i !== index));
        }
    };

    const updateLeader = (
        index: number,
        field: keyof LeaderFormData,
        value: string,
    ) => {
        const updated = [...leaders];
        updated[index][field] = value;
        setLeaders(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate: at least one leader with name
            const validLeaders = leaders.filter((l) => l.name.trim() !== "");
            if (validLeaders.length === 0) {
                alert("Bitte mindestens einen Leiter eintragen");
                setIsSubmitting(false);
                return;
            }

            // Delete existing leaders first if any exist
            if (existingLeaders.length > 0) {
                await deleteMeetingLeaders(meetingId);
            }

            const result = await createMeetingLeaders(meetingId, validLeaders);

            if (result.success) {
                // Navigate to participants step
                router.push(conductRoutes.participants(meetingId));
            } else {
                alert(result.error || "Fehler beim Speichern");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Ein Fehler ist aufgetreten");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Versammlungsleiter festlegen</CardTitle>
                    <CardDescription>
                        Tragen Sie die Personen ein, die die Versammlung leiten
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {leaders.map((leader, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-gray-600">
                                    Person {index + 1}
                                </span>
                                {leaders.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLeader(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`name-${index}`}>
                                        Name *
                                    </Label>
                                    <Input
                                        id={`name-${index}`}
                                        placeholder="z.B. Max Mustermann"
                                        value={leader.name}
                                        onChange={(e) =>
                                            updateLeader(
                                                index,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`role-${index}`}>
                                        Rolle
                                    </Label>
                                    <Select
                                        value={leader.role}
                                        onValueChange={(value) =>
                                            updateLeader(index, "role", value)
                                        }
                                    >
                                        <SelectTrigger id={`role-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEADER_ROLES.map((role) => (
                                                <SelectItem
                                                    key={role.value}
                                                    value={role.value}
                                                >
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addLeader}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Weitere Person hinzufügen
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Wird gespeichert..." : "Weiter"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
