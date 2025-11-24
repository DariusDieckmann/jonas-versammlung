"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createUnit, updateUnit } from "../unit.action";
import { insertUnitSchema, type InsertUnit, type Unit } from "../schemas/unit.schema";

interface UnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    propertyId: number;
    unit?: Unit;
    onSuccess: () => void;
}

export function UnitDialog({
    open,
    onOpenChange,
    propertyId,
    unit,
    onSuccess,
}: UnitDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InsertUnit>({
        resolver: zodResolver(insertUnitSchema),
        defaultValues: {
            propertyId: propertyId,
            name: "",
            floor: undefined,
            area: undefined,
            ownershipShares: undefined,
            notes: undefined,
        },
    });

    // Update form values when unit changes or dialog opens
    useEffect(() => {
        if (open) {
            if (unit) {
                form.reset({
                    propertyId: unit.propertyId,
                    name: unit.name,
                    floor: unit.floor ?? undefined,
                    area: unit.area ?? undefined,
                    ownershipShares: unit.ownershipShares,
                    notes: unit.notes ?? undefined,
                });
            } else {
                form.reset({
                    propertyId: propertyId,
                    name: "",
                    floor: undefined,
                    area: undefined,
                    ownershipShares: undefined,
                    notes: undefined,
                });
            }
        }
    }, [open, unit, propertyId, form]);

    async function onSubmit(data: InsertUnit) {
        setIsSubmitting(true);
        try {
            let result;
            if (unit) {
                result = await updateUnit(unit.id, data);
            } else {
                result = await createUnit(data);
            }

            if (result.success) {
                toast.success(
                    unit
                        ? "Einheit erfolgreich aktualisiert"
                        : "Einheit erfolgreich erstellt"
                );
                form.reset();
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error(result.error || "Ein Fehler ist aufgetreten");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {unit ? "Einheit bearbeiten" : "Neue Einheit hinzufügen"}
                    </DialogTitle>
                    <DialogDescription>
                        {unit
                            ? "Bearbeite die Daten der Einheit"
                            : "Erfasse die Daten einer neuen Einheit"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Einheit *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="z.B. Wohnung 3a, Gewerbe EG" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="floor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Etage</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="z.B. 2"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseInt(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fläche (m²)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="z.B. 85.5"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseFloat(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ownershipShares"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MEA *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="z.B. 125"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseInt(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notizen</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Optionale Notizen zur Einheit"
                                            rows={3}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Wird gespeichert..."
                                    : unit
                                      ? "Aktualisieren"
                                      : "Erstellen"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
