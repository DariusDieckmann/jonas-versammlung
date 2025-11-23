"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createOwner, updateOwner } from "../owner.action";
import { insertOwnerSchema, type InsertOwner, type Owner } from "../schemas/owner.schema";
import { getProperties } from "@/modules/properties/shared/property.action";
import type { Property } from "@/modules/properties/shared/schemas/property.schema";

interface OwnerFormProps {
    initialData?: Owner;
    preselectedPropertyId?: number;
}

export function OwnerForm({ initialData, preselectedPropertyId }: OwnerFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(true);

    const form = useForm<InsertOwner>({
        resolver: zodResolver(insertOwnerSchema),
        defaultValues: initialData
            ? {
                  propertyId: initialData.propertyId,
                  firstName: initialData.firstName,
                  lastName: initialData.lastName,
                  email: initialData.email ?? undefined,
                  phone: initialData.phone ?? undefined,
                  ownershipShares: initialData.ownershipShares,
                  unit: initialData.unit ?? undefined,
                  notes: initialData.notes ?? undefined,
              }
            : {
                  propertyId: preselectedPropertyId || undefined,
                  firstName: "",
                  lastName: "",
                  email: undefined,
                  phone: undefined,
                  ownershipShares: undefined,
                  unit: undefined,
                  notes: undefined,
              },
    });

    useEffect(() => {
        async function loadProperties() {
            try {
                const props = await getProperties();
                setProperties(props);
            } catch (error) {
                console.error("Error loading properties:", error);
                toast.error("Fehler beim Laden der Liegenschaften");
            } finally {
                setIsLoadingProperties(false);
            }
        }
        loadProperties();
    }, []);

    async function onSubmit(data: InsertOwner) {
        setIsSubmitting(true);
        try {
            let result;
            if (initialData) {
                result = await updateOwner(initialData.id, data);
            } else {
                result = await createOwner(data);
            }

            if (result.success) {
                toast.success(
                    initialData
                        ? "Eigentümer erfolgreich aktualisiert"
                        : "Eigentümer erfolgreich erstellt"
                );
                router.push("/dashboard/owners");
                router.refresh();
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

    if (isLoadingProperties) {
        return <div>Lädt Liegenschaften...</div>;
    }

    if (properties.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground mb-4">
                    Keine Liegenschaften vorhanden. Bitte erstelle zuerst eine Liegenschaft.
                </p>
                <Button onClick={() => router.push("/dashboard/properties/new")}>
                    Liegenschaft erstellen
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Liegenschaft *</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value?.toString()}
                                disabled={!!initialData}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wähle eine Liegenschaft" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {properties.map((property) => (
                                        <SelectItem
                                            key={property.id}
                                            value={property.id.toString()}
                                        >
                                            {property.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vorname *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Max" {...field} />
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
                                    <Input placeholder="Mustermann" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="ownershipShares"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Miteigentumsanteile *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="z.B. 125 (von 1000)"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(parseInt(e.target.value) || 0)
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Einheit/Wohnung</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="z.B. Wohnung 3a" 
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
                                    rows={4}
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Wird gespeichert..."
                            : initialData
                              ? "Aktualisieren"
                              : "Erstellen"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Abbrechen
                    </Button>
                </div>
            </form>
        </Form>
    );
}
