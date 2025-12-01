"use client";

import { ChevronRight, FileText, Plus, Trash2, Library } from "lucide-react";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaceholderPicker } from "@/components/ui/placeholder-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AgendaItemTemplate } from "../schemas/agenda-item-template.schema";

export interface AgendaItemFormData {
    title: string;
    description: string;
    requiresResolution: boolean;
}

interface AgendaItemsFormSectionProps {
    value: AgendaItemFormData[];
    onChange: (items: AgendaItemFormData[]) => void;
    templates?: AgendaItemTemplate[];
}

export function AgendaItemsFormSection({
    value,
    onChange,
    templates = [],
}: AgendaItemsFormSectionProps) {
    const [items, setItems] = useState<AgendaItemFormData[]>(
        value.length > 0
            ? value
            : [{ title: "", description: "", requiresResolution: false }],
    );
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

    const updateItems = (newItems: AgendaItemFormData[]) => {
        setItems(newItems);
        onChange(newItems);
    };

    const addItem = () => {
        const newItems = [
            ...items,
            { title: "", description: "", requiresResolution: false },
        ];
        updateItems(newItems);
        setSelectedIndex(newItems.length - 1); // Select the newly added item
    };

    const addItemFromTemplate = (templateId: string) => {
        const template = templates.find((t) => t.id === Number(templateId));
        if (!template) return;

        const newItems = [
            ...items,
            {
                title: template.title,
                description: template.description || "",
                requiresResolution: template.requiresResolution,
            },
        ];
        updateItems(newItems);
        setSelectedIndex(newItems.length - 1);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            updateItems(newItems);
            // Adjust selected index if needed
            if (selectedIndex >= newItems.length) {
                setSelectedIndex(newItems.length - 1);
            } else if (selectedIndex === index && index > 0) {
                setSelectedIndex(index - 1);
            }
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
        setSelectedIndex(targetIndex); // Follow the moved item
    };

    const insertPlaceholderInDescription = (placeholder: string) => {
        if (descriptionTextareaRef.current) {
            const textarea = descriptionTextareaRef.current;
            const start = textarea.selectionStart || 0;
            const end = textarea.selectionEnd || 0;
            const currentValue = items[selectedIndex].description;
            const newValue =
                currentValue.substring(0, start) +
                placeholder +
                currentValue.substring(end);
            updateItem(selectedIndex, "description", newValue);
            // Set focus back and move cursor
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                    start + placeholder.length,
                    start + placeholder.length,
                );
            }, 0);
        }
    };

    const selectedItem = items[selectedIndex];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5" />
                    Tagesordnung
                </CardTitle>
                <CardDescription className="text-sm">
                    Füge Tagesordnungspunkte für die Versammlung hinzu
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex gap-4 h-[500px]">
                    {/* Left Side - List of TOPs (30%) */}
                    <div className="w-[30%] flex flex-col gap-2">
                        <div className="flex-1 border rounded-lg overflow-y-auto p-2 space-y-1">
                            {items.map((item, index) => (
                                <button
                                    key={`agenda-item-${index}-${item.title}`}
                                    type="button"
                                    onClick={() => setSelectedIndex(index)}
                                    className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                                        selectedIndex === index
                                            ? "bg-blue-50 border-2 border-blue-500"
                                            : "bg-white border border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <span className="text-xs font-semibold text-gray-500">
                                                TOP {index + 1}
                                            </span>
                                            {item.requiresResolution && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] py-0 px-1.5"
                                                >
                                                    Beschluss
                                                </Badge>
                                            )}
                                        </div>
                                        <ChevronRight
                                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                                                selectedIndex === index
                                                    ? "text-blue-500"
                                                    : "text-gray-400"
                                            }`}
                                        />
                                    </div>
                                    <div className="mt-1 text-sm font-medium truncate">
                                        {item.title || (
                                            <span className="text-gray-400 text-xs">
                                                Ohne Titel
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Add Buttons */}
                        <div className="space-y-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                                className="w-full"
                                size="sm"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                TOP hinzufügen
                            </Button>

                            {templates.length > 0 && (
                                <Select onValueChange={addItemFromTemplate}>
                                    <SelectTrigger className="w-full h-9">
                                        <SelectValue placeholder="Aus Vorlage hinzufügen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((template) => (
                                            <SelectItem
                                                key={template.id}
                                                value={template.id.toString()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Library className="h-3 w-3" />
                                                    <span>{template.title}</span>
                                                    {template.requiresResolution && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 px-1"
                                                        >
                                                            Beschluss
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Detail View (70%) */}
                    <div className="w-[70%] border rounded-lg p-3 overflow-y-auto">
                        {selectedItem && (
                            <div className="space-y-4">
                                {/* Header with controls */}
                                <div className="flex items-center justify-between pb-3 border-b">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-gray-700">
                                            TOP {selectedIndex + 1}
                                        </h3>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    moveItem(
                                                        selectedIndex,
                                                        "up",
                                                    )
                                                }
                                                disabled={selectedIndex === 0}
                                                className="h-7 w-7 p-0"
                                            >
                                                ↑
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    moveItem(
                                                        selectedIndex,
                                                        "down",
                                                    )
                                                }
                                                disabled={
                                                    selectedIndex ===
                                                    items.length - 1
                                                }
                                                className="h-7 w-7 p-0"
                                            >
                                                ↓
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            removeItem(selectedIndex)
                                        }
                                        disabled={items.length === 1}
                                        className="h-7 w-7 p-0"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>

                                {/* Title */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="agenda-title"
                                        className="text-sm"
                                    >
                                        Titel
                                    </Label>
                                    <Input
                                        id="agenda-title"
                                        placeholder="z.B. Genehmigung des Protokolls"
                                        value={selectedItem.title}
                                        onChange={(e) =>
                                            updateItem(
                                                selectedIndex,
                                                "title",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="h-9"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="agenda-description"
                                        className="text-sm"
                                    >
                                        Beschreibung
                                    </Label>
                                    <div className="space-y-2">
                                        <Textarea
                                            id="agenda-description"
                                            ref={descriptionTextareaRef}
                                            placeholder="Zusätzliche Details oder Kontext..."
                                            value={selectedItem.description}
                                            onChange={(e) =>
                                                updateItem(
                                                    selectedIndex,
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            rows={6}
                                            className="text-sm"
                                        />
                                        <PlaceholderPicker
                                            onSelect={
                                                insertPlaceholderInDescription
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Requires Resolution */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agenda-resolution"
                                        checked={
                                            selectedItem.requiresResolution
                                        }
                                        onCheckedChange={(checked) =>
                                            updateItem(
                                                selectedIndex,
                                                "requiresResolution",
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="agenda-resolution"
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        Erfordert Beschlussfassung
                                    </Label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
