"use client";

import { Copy, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getPlaceholderCategories,
    getPlaceholdersByCategory,
} from "@/lib/placeholder-utils";
import toast from "react-hot-toast";

interface PlaceholderPickerProps {
    onSelect: (placeholder: string) => void;
}

export function PlaceholderPicker({ onSelect }: PlaceholderPickerProps) {
    const [value, setValue] = useState<string>("");
    const categories = getPlaceholderCategories();

    const handleSelect = (selectedValue: string) => {
        onSelect(selectedValue);
        setValue(""); // Reset nach Auswahl
        toast.success("Platzhalter eingefügt");
    };

    const handleCopy = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        toast.success("In Zwischenablage kopiert");
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="h-3.5 w-3.5" />
                <span>
                    Platzhalter werden später automatisch mit Meeting-Daten
                    ersetzt
                </span>
            </div>

            <Select onValueChange={handleSelect} value={value}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Platzhalter einfügen..." />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((category) => (
                        <SelectGroup key={category}>
                            <SelectLabel className="text-sm font-semibold text-gray-900 py-2 px-2 bg-blue-50 border-b border-blue-200">
                                {category}
                            </SelectLabel>
                            {getPlaceholdersByCategory(category).map(
                                (placeholder) => (
                                    <SelectItem
                                        key={placeholder.value}
                                        value={placeholder.value}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {placeholder.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {placeholder.description}
                                                </div>
                                                <div className="text-xs text-blue-600 font-mono mt-1">
                                                    {placeholder.value}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) =>
                                                    handleCopy(
                                                        placeholder.value,
                                                        e,
                                                    )
                                                }
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </SelectItem>
                                ),
                            )}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
