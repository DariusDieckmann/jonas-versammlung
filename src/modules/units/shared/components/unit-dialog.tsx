"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { createUnit, updateUnit } from "../unit.action";
import { createOwner, updateOwner, deleteOwner, getOwnersByUnit } from "@/modules/owners/shared/owner.action";
import { insertUnitSchema, type InsertUnit, type Unit } from "../schemas/unit.schema";
import { insertOwnerSchema, type InsertOwner, type Owner } from "@/modules/owners/shared/schemas/owner.schema";
import { z } from "zod";

// Extended schema that includes single owner for unit management
const unitWithOwnerSchema = insertUnitSchema.extend({
    owner: z.object({
        id: z.number().optional(), // For existing owner
        firstName: z.string().min(1, "Vorname ist erforderlich"),
        lastName: z.string().min(1, "Nachname ist erforderlich"),
        email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
        phone: z.string().optional(),
        notes: z.string().optional(),
    }).optional(),
});

type UnitWithOwner = z.infer<typeof unitWithOwnerSchema>;

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
    const [loadingOwners, setLoadingOwners] = useState(false);

    const form = useForm<UnitWithOwner>({
        resolver: zodResolver(unitWithOwnerSchema),
        mode: "onSubmit", // Only validate on submit, not during typing
        defaultValues: {
            propertyId: propertyId,
            name: "",
            floor: undefined,
            area: undefined,
            ownershipShares: undefined,
            notes: undefined,
            owner: undefined,
        },
    });

    // Load owner when editing a unit
    useEffect(() => {
        async function loadOwner() {
            if (open && unit) {
                setLoadingOwners(true);
                try {
                    const owners = await getOwnersByUnit(unit.id);
                    const owner = owners[0]; // Get the first (and only) owner
                    
                    form.reset({
                        propertyId: unit.propertyId,
                        name: unit.name,
                        floor: unit.floor ?? undefined,
                        area: unit.area ?? undefined,
                        ownershipShares: unit.ownershipShares,
                        notes: unit.notes ?? undefined,
                        owner: owner ? {
                            id: owner.id,
                            firstName: owner.firstName,
                            lastName: owner.lastName,
                            email: owner.email || "",
                            phone: owner.phone || "",
                            notes: owner.notes || "",
                        } : undefined,
                    });
                } catch (error) {
                    console.error("Error loading owner:", error);
                    toast.error("Fehler beim Laden des Eigentümers");
                } finally {
                    setLoadingOwners(false);
                }
            } else if (open && !unit) {
                form.reset({
                    propertyId: propertyId,
                    name: "",
                    floor: undefined,
                    area: undefined,
                    ownershipShares: undefined,
                    notes: undefined,
                    owner: undefined,
                });
            }
        }
        loadOwner();
    }, [open, unit, propertyId, form]);

    async function onSubmit(data: UnitWithOwner) {
        setIsSubmitting(true);
        try {
            let result: { success: boolean; error?: string; unitId?: number };
            
            if (unit) {
                // Update the unit (propertyId cannot be changed for security)
                result = await updateUnit(unit.id, {
                    name: data.name,
                    floor: data.floor,
                    area: data.area,
                    ownershipShares: data.ownershipShares,
                    notes: data.notes,
                });

                // Handle single owner - create, update, or delete
                if (result.success) {
                    const existingOwners = await getOwnersByUnit(unit.id);
                    const existingOwner = existingOwners[0]; // Get the first (and only) owner

                    if (data.owner) {
                        // User wants an owner
                        if (existingOwner) {
                            // Update existing owner
                            const ownerResult = await updateOwner(existingOwner.id, {
                                firstName: data.owner.firstName,
                                lastName: data.owner.lastName,
                                email: data.owner.email || null,
                                phone: data.owner.phone || null,
                                notes: data.owner.notes || null,
                            });
                            
                            if (!ownerResult.success) {
                                toast.error("Einheit aktualisiert, aber Eigentümer konnte nicht aktualisiert werden");
                            }
                        } else {
                            // Create new owner
                            const ownerResult = await createOwner({
                                unitId: unit.id,
                                firstName: data.owner.firstName,
                                lastName: data.owner.lastName,
                                email: data.owner.email || null,
                                phone: data.owner.phone || null,
                                notes: data.owner.notes || null,
                            });
                            
                            if (!ownerResult.success) {
                                toast.error("Einheit aktualisiert, aber Eigentümer konnte nicht hinzugefügt werden");
                            }
                        }
                    } else if (existingOwner) {
                        // User removed the owner - delete it
                        await deleteOwner(existingOwner.id);
                    }
                }
            } else {
                // Create unit
                result = await createUnit({
                    propertyId: data.propertyId,
                    name: data.name,
                    floor: data.floor,
                    area: data.area,
                    ownershipShares: data.ownershipShares,
                    notes: data.notes,
                });

                // If successful and owner was provided, create it
                if (result.success && result.unitId && data.owner) {
                    const ownerResult = await createOwner({
                        unitId: result.unitId,
                        firstName: data.owner.firstName,
                        lastName: data.owner.lastName,
                        email: data.owner.email || null,
                        phone: data.owner.phone || null,
                        notes: data.owner.notes || null,
                    });
                    
                    if (!ownerResult.success) {
                        toast.error("Einheit erstellt, aber Eigentümer konnte nicht hinzugefügt werden");
                    }
                }
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        field.onChange(null);
                                                        return;
                                                    }
                                                    field.onChange(parseInt(raw, 10));
                                                }}
                                            />
                                        </FormControl>
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
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        field.onChange(null);
                                                        return;
                                                    }
                                                    field.onChange(parseFloat(raw));
                                                }}
                                            />
                                        </FormControl>
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
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        field.onChange(null);
                                                        return;
                                                    }
                                                    field.onChange(parseInt(raw, 10));
                                                }}
                                            />
                                        </FormControl>
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
                                </FormItem>
                            )}
                        />

                        <Separator className="my-6" />
                        
                        <div>
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">
                                    {unit ? "Eigentümer" : "Eigentümer (optional)"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {unit 
                                        ? "Verwalte den Eigentümer für diese Einheit"
                                        : "Füge direkt einen Eigentümer für diese Einheit hinzu"
                                    }
                                </p>
                            </div>

                            {loadingOwners ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Lade Eigentümer...
                                </div>
                            ) : (
                                <>
                                    {form.watch("owner") ? (
                                        <div className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-sm">Eigentümer</h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => form.setValue("owner", undefined)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="owner.firstName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Vorname *</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="owner.lastName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nachname *</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="owner.email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>E-Mail</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="email"
                                                                    placeholder="max@example.com"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="owner.phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Telefon</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="tel"
                                                                    placeholder="+49 123 456789"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="owner.notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Notizen</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Zusätzliche Informationen..."
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg border-dashed">
                                                Kein Eigentümer zugewiesen
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    form.setValue("owner", {
                                                        firstName: "",
                                                        lastName: "",
                                                        email: "",
                                                        phone: "",
                                                        notes: "",
                                                    })
                                                }
                                                disabled={loadingOwners}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Eigentümer hinzufügen
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

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
