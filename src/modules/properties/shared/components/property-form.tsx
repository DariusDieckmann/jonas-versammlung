"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import propertiesRoutes from "../../properties.route";
import { createProperty, updateProperty } from "../../shared/property.action";
import {
    insertPropertySchema,
    type Property,
} from "../../shared/schemas/property.schema";

type FormData = z.infer<typeof insertPropertySchema>;

interface PropertyFormProps {
    initialData?: Property;
}

export function PropertyForm({ initialData }: PropertyFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData;

    const form = useForm<FormData>({
        resolver: zodResolver(insertPropertySchema),
        defaultValues: {
            name: initialData?.name || "",
            street: initialData?.street || "",
            houseNumber: initialData?.houseNumber || "",
            postalCode: initialData?.postalCode || "",
            city: initialData?.city || "",
            yearBuilt: initialData?.yearBuilt || undefined,
            numberOfUnits: initialData?.numberOfUnits || undefined,
            totalArea: initialData?.totalArea || undefined,
            notes: initialData?.notes || "",
        },
    });

    async function onSubmit(data: FormData) {
        setIsSubmitting(true);

        try {
            if (isEditing && initialData) {
                const result = await updateProperty(initialData.id, data);
                if (result.success) {
                    router.push(propertiesRoutes.detail(initialData.id));
                    router.refresh();
                } else {
                    alert(result.error || "Fehler beim Aktualisieren");
                }
            } else {
                const result = await createProperty(data);
                if (result.success && result.propertyId) {
                    router.push(propertiesRoutes.detail(result.propertyId));
                    router.refresh();
                } else {
                    alert(result.error || "Fehler beim Erstellen");
                }
            }
        } catch (error) {
            console.error("Form submission error:", error);
            alert("Ein Fehler ist aufgetreten");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing
                        ? "Liegenschaft bearbeiten"
                        : "Neue Liegenschaft erstellen"}
                </CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Aktualisiere die Informationen dieser Liegenschaft"
                        : "Füge eine neue Liegenschaft zu deiner Verwaltung hinzu"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name/Bezeichnung *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="z.B. Wohnanlage Musterstraße"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Adresse */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Straße *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Musterstraße"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="houseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hausnummer *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="42a"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PLZ *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="12345"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Ort *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Musterstadt"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Optionale Felder */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="yearBuilt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Baujahr</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2020"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
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
                                name="numberOfUnits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Anzahl Einheiten</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="12"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Wohnungen/Gewerbe
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="totalArea"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gesamtfläche (m²)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1500"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notizen */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notizen</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Weitere Informationen..."
                                            className="resize-none"
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
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting
                                    ? "Wird gespeichert..."
                                    : isEditing
                                      ? "Änderungen speichern"
                                      : "Liegenschaft erstellen"}
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
            </CardContent>
        </Card>
    );
}
