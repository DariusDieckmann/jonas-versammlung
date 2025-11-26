"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface AgendaItemFormData {
    title: string;
    description: string;
    requiresResolution: boolean;
}

interface AgendaItemsFormSectionProps {
    value: AgendaItemFormData[];
    onChange: (items: AgendaItemFormData[]) => void;
}

export function AgendaItemsFormSection({
    value,
    onChange,
}: AgendaItemsFormSectionProps) {
    const [items, setItems] = useState<AgendaItemFormData[]>(
        value.length > 0
            ? value
            : [{ title: "", description: "", requiresResolution: false }],
    );

    const updateItems = (newItems: AgendaItemFormData[]) => {
        setItems(newItems);
        onChange(newItems);
    };

    const addItem = () => {
        updateItems([
            ...items,
            { title: "", description: "", requiresResolution: false },
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            updateItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (
        index: number,
        field: keyof AgendaItemFormData,
        value: string | boolean,
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        updateItems(newItems);
    };

    const moveItem = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === items.length - 1)
        ) {
            return;
        }

        const newItems = [...items];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [
            newItems[targetIndex],
            newItems[index],
        ];
        updateItems(newItems);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tagesordnung
                </CardTitle>
                <CardDescription>
                    Füge Tagesordnungspunkte für die Versammlung hinzu
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <Card key={index} className="border-2">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Header with controls */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-500">
                                            TOP {index + 1}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    moveItem(index, "up")
                                                }
                                                disabled={index === 0}
                                            >
                                                ↑
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    moveItem(index, "down")
                                                }
                                                disabled={
                                                    index === items.length - 1
                                                }
                                            >
                                                ↓
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor={`agenda-title-${index}`}>
                                        Titel *
                                    </Label>
                                    <Input
                                        id={`agenda-title-${index}`}
                                        placeholder="z.B. Genehmigung des Protokolls"
                                        value={item.title}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "title",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor={`agenda-description-${index}`}
                                    >
                                        Beschreibung
                                    </Label>
                                    <Textarea
                                        id={`agenda-description-${index}`}
                                        placeholder="Zusätzliche Details oder Kontext..."
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </div>

                                {/* Requires Resolution */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`agenda-resolution-${index}`}
                                        checked={item.requiresResolution}
                                        onCheckedChange={(checked) =>
                                            updateItem(
                                                index,
                                                "requiresResolution",
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor={`agenda-resolution-${index}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        Erfordert Beschlussfassung
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add Button */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tagesordnungspunkt hinzufügen
                </Button>
            </CardContent>
        </Card>
    );
}
