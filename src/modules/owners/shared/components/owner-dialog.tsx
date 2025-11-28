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
import { createOwner, updateOwner } from "../owner.action";
import {
    type InsertOwner,
    insertOwnerSchema,
    type Owner,
} from "../schemas/owner.schema";

interface OwnerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitId: number;
    owner?: Owner;
    onSuccess: () => void;
}

export function OwnerDialog({
    open,
    onOpenChange,
    unitId,
    owner,
    onSuccess,
}: OwnerDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InsertOwner>({
        resolver: zodResolver(insertOwnerSchema),
        defaultValues: {
            unitId: unitId,
            firstName: "",
            lastName: "",
            email: undefined,
            phone: undefined,
            notes: undefined,
        },
    });

    // Update form values when owner changes or dialog opens
    useEffect(() => {
        if (open) {
            if (owner) {
                form.reset({
                    unitId: owner.unitId,
                    firstName: owner.firstName,
                    lastName: owner.lastName,
                    email: owner.email ?? undefined,
                    phone: owner.phone ?? undefined,
                    notes: owner.notes ?? undefined,
                });
            } else {
                form.reset({
                    unitId: unitId,
                    firstName: "",
                    lastName: "",
                    email: undefined,
                    phone: undefined,
                    notes: undefined,
                });
            }
        }
    }, [open, owner, unitId, form]);

    async function onSubmit(data: InsertOwner) {
        setIsSubmitting(true);
        try {
            let result: { success: boolean; error?: string; ownerId?: number };
            if (owner) {
                result = await updateOwner(owner.id, data);
            } else {
                result = await createOwner(data);
            }

            if (result.success) {
                toast.success(
                    owner
                        ? "Eigentümer erfolgreich aktualisiert"
                        : "Eigentümer erfolgreich erstellt",
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
                        {owner
                            ? "Eigentümer bearbeiten"
                            : "Neuen Eigentümer hinzufügen"}
                    </DialogTitle>
                    <DialogDescription>
                        {owner
                            ? "Bearbeite die Daten des Eigentümers"
                            : "Erfasse die Daten eines neuen Eigentümers"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vorname *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Max"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nachname *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Mustermann"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-Mail</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="max@example.com"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefon</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="+49 123 456789"
                                                {...field}
                                                value={field.value || ""}
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
                                            placeholder="Optionale Notizen zum Eigentümer"
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
                                    : owner
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
