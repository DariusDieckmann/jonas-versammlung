"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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

// Extended schema that includes owners for unit management
const unitWithOwnersSchema = insertUnitSchema.extend({
    owners: z.array(
        z.object({
            id: z.number().optional(), // For existing owners
            firstName: z.string().min(1, "Vorname ist erforderlich"),
            lastName: z.string().min(1, "Nachname ist erforderlich"),
            email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
            phone: z.string().optional(),
            sharePercentage: z.number().int().min(1, "Anteil muss mindestens 1% betragen").max(100, "Anteil darf maximal 100% betragen").optional().nullable(),
            notes: z.string().optional(),
            _deleted: z.boolean().optional(), // To track deletions
        })
    ).optional(),
}).superRefine((data, ctx) => {
    // Validate that total share percentage does not exceed 100%
    if (data.owners && data.owners.length > 0) {
        const activeOwners = data.owners.filter(o => !o._deleted);
        const totalPercentage = activeOwners.reduce(
            (sum, owner) => sum + (owner.sharePercentage || 0),
            0
        );
        
        if (totalPercentage > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Die Summe der Anteile (${totalPercentage}%) darf 100% nicht überschreiten`,
                path: ["owners"],
            });
        }
    }
});

type UnitWithOwners = z.infer<typeof unitWithOwnersSchema>;

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

    const form = useForm<UnitWithOwners>({
        resolver: zodResolver(unitWithOwnersSchema),
        mode: "onSubmit", // Only validate on submit, not during typing
        defaultValues: {
            propertyId: propertyId,
            name: "",
            floor: undefined,
            area: undefined,
            ownershipShares: undefined,
            notes: undefined,
            owners: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "owners",
    });

    // Load owners when editing a unit
    useEffect(() => {
        async function loadOwners() {
            if (open && unit) {
                setLoadingOwners(true);
                try {
                    const owners = await getOwnersByUnit(unit.id);
                    form.reset({
                        propertyId: unit.propertyId,
                        name: unit.name,
                        floor: unit.floor ?? undefined,
                        area: unit.area ?? undefined,
                        ownershipShares: unit.ownershipShares,
                        notes: unit.notes ?? undefined,
                        owners: owners.map(o => ({
                            id: o.id,
                            firstName: o.firstName,
                            lastName: o.lastName,
                            email: o.email || "",
                            phone: o.phone || "",
                            sharePercentage: o.sharePercentage ?? undefined,
                            notes: o.notes || "",
                        })),
                    });
                } catch (error) {
                    console.error("Error loading owners:", error);
                    toast.error("Fehler beim Laden der Eigentümer");
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
                    owners: [],
                });
            }
        }
        loadOwners();
    }, [open, unit, propertyId, form]);

    async function onSubmit(data: UnitWithOwners) {
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

                // Handle owners - create new ones, update existing, delete removed
                if (result.success && data.owners) {
                    const ownerPromises = [];
                    
                    for (const owner of data.owners) {
                        if (owner._deleted && owner.id) {
                            // Delete existing owner
                            ownerPromises.push(deleteOwner(owner.id));
                        } else if (owner.id) {
                            // Update existing owner (unitId is not changeable for security)
                            ownerPromises.push(
                                updateOwner(owner.id, {
                                    firstName: owner.firstName,
                                    lastName: owner.lastName,
                                    email: owner.email || null,
                                    phone: owner.phone || null,
                                    sharePercentage: owner.sharePercentage || null,
                                    notes: owner.notes || null,
                                })
                            );
                        } else {
                            // Create new owner
                            ownerPromises.push(
                                createOwner({
                                    unitId: unit.id,
                                    firstName: owner.firstName,
                                    lastName: owner.lastName,
                                    email: owner.email || null,
                                    phone: owner.phone || null,
                                    sharePercentage: owner.sharePercentage || null,
                                    notes: owner.notes || null,
                                })
                            );
                        }
                    }

                    const ownerResults = await Promise.all(ownerPromises);
                    const failedOwners = ownerResults.filter((r) => !r.success);
                    
                    if (failedOwners.length > 0) {
                        toast.error(
                            `Einheit aktualisiert, aber ${failedOwners.length} Eigentümer konnte(n) nicht gespeichert werden`
                        );
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

                // If successful and owners were provided, create them
                if (result.success && result.unitId && data.owners && data.owners.length > 0) {
                    const ownerPromises = data.owners.map((owner) =>
                        createOwner({
                            unitId: result.unitId!,
                            firstName: owner.firstName,
                            lastName: owner.lastName,
                            email: owner.email || null,
                            phone: owner.phone || null,
                            sharePercentage: owner.sharePercentage || null,
                            notes: owner.notes || null,
                        })
                    );

                    const ownerResults = await Promise.all(ownerPromises);
                    const failedOwners = ownerResults.filter((r) => !r.success);
                    
                    if (failedOwners.length > 0) {
                        toast.error(
                            `Einheit erstellt, aber ${failedOwners.length} Eigentümer konnte(n) nicht hinzugefügt werden`
                        );
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
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {unit ? "Eigentümer" : "Eigentümer (optional)"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {unit 
                                            ? "Verwalte die Eigentümer für diese Einheit"
                                            : "Füge direkt Eigentümer für diese Einheit hinzu"
                                        }
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            firstName: "",
                                            lastName: "",
                                            email: "",
                                            phone: "",
                                            sharePercentage: undefined,
                                            notes: "",
                                        })
                                    }
                                    disabled={loadingOwners}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Eigentümer hinzufügen
                                </Button>
                            </div>

                            {fields.length > 0 && (() => {
                                const totalPercentage = fields.reduce(
                                    (sum, _, index) => {
                                        const value = form.watch(`owners.${index}.sharePercentage`);
                                        return sum + (value || 0);
                                    },
                                    0
                                );
                                const isOverLimit = totalPercentage > 100;

                                return (
                                    <div className={`mb-4 p-3 text-sm rounded-md ${
                                        isOverLimit 
                                            ? 'bg-destructive/10 text-destructive' 
                                            : totalPercentage === 100
                                                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                                : 'bg-muted'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Summe der Anteile: {totalPercentage}%
                                            </span>
                                            {isOverLimit && (
                                                <span className="text-xs">
                                                    ⚠️ Überschreitung um {totalPercentage - 100}%
                                                </span>
                                            )}
                                            {totalPercentage === 100 && (
                                                <span className="text-xs">
                                                    ✓ Vollständig vergeben
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {form.formState.errors.owners && (
                                <div className="mb-4 p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                                    {form.formState.errors.owners.message}
                                </div>
                            )}

                            {loadingOwners ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Lade Eigentümer...
                                </div>
                            ) : fields.length > 0 ? (
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div
                                                    key={field.id}
                                                    className="border rounded-lg p-4 space-y-4"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium text-sm">
                                                            Eigentümer {index + 1}
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`owners.${index}.firstName`}
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
                                                            name={`owners.${index}.lastName`}
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
                                                            name={`owners.${index}.email`}
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
                                                            name={`owners.${index}.phone`}
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
                                                        name={`owners.${index}.sharePercentage`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Anteil (%)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        max="100"
                                                                        placeholder="z.B. 50"
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
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg border-dashed">
                                            Keine Eigentümer hinzugefügt
                                        </div>
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
