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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createMeeting,
    updateMeeting,
} from "../meeting.action";
import {
    insertMeetingSchema,
    type Meeting,
} from "../schemas/meeting.schema";
import type { Property } from "@/modules/properties/shared/schemas/property.schema";
import meetingsRoutes from "../../meetings.route";
import {
    AgendaItemsFormSection,
    type AgendaItemFormData,
} from "./agenda-items-form-section";
import { createAgendaItems, getAgendaItems } from "../agenda-item.action";
import type { AgendaItem } from "../schemas/agenda-item.schema";

type FormData = z.infer<typeof insertMeetingSchema>;

interface MeetingFormProps {
    properties: Property[];
    initialData?: Meeting;
    initialAgendaItems?: AgendaItem[];
}

export function MeetingForm({
    properties,
    initialData,
    initialAgendaItems = [],
}: MeetingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agendaItems, setAgendaItems] = useState<AgendaItemFormData[]>(
        initialAgendaItems.length > 0
            ? initialAgendaItems.map((item) => ({
                  title: item.title,
                  description: item.description || "",
                  requiresResolution: item.requiresResolution,
              }))
            : [{ title: "", description: "", requiresResolution: false }],
    );
    const isEditing = !!initialData;

    const form = useForm<FormData>({
        resolver: zodResolver(insertMeetingSchema),
        defaultValues: {
            propertyId: initialData?.propertyId || (properties[0]?.id ?? 0),
            title: initialData?.title || "",
            date: initialData?.date || "",
            startTime: initialData?.startTime || "",
            endTime: initialData?.endTime || "",
            locationName: initialData?.locationName || "",
            locationAddress: initialData?.locationAddress || "",
            invitationDeadline: initialData?.invitationDeadline || "",
            status: "planned", // Status wird automatisch gesetzt
        },
    });

    async function onSubmit(data: FormData) {
        setIsSubmitting(true);

        try {
            if (isEditing && initialData) {
                const result = await updateMeeting(initialData.id, data);
                if (result.success) {
                    // Note: Agenda items are updated separately if needed
                    router.push(meetingsRoutes.detail(initialData.id));
                    router.refresh();
                } else {
                    alert(result.error || "Fehler beim Aktualisieren");
                }
            } else {
                // Create meeting first
                const result = await createMeeting(data);
                if (result.success && result.meetingId) {
                    // Create agenda items if we have any with titles
                    const validAgendaItems = agendaItems
                        .filter((item) => item.title.trim() !== "")
                        .map((item, index) => ({
                            ...item,
                            orderIndex: index,
                        }));

                    if (validAgendaItems.length > 0) {
                        await createAgendaItems(
                            result.meetingId,
                            validAgendaItems,
                        );
                    }

                    router.push(meetingsRoutes.detail(result.meetingId));
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

    if (properties.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Keine Liegenschaften verfügbar</CardTitle>
                    <CardDescription>
                        Du musst zuerst eine Liegenschaft erstellen, bevor du eine Versammlung anlegen kannst.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing
                        ? "Versammlung bearbeiten"
                        : "Neue Versammlung erstellen"}
                </CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Bearbeite die Details der Versammlung"
                        : "Fülle die folgenden Felder aus, um eine neue Versammlung anzulegen"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Property Selection */}
                        <FormField
                            control={form.control}
                            name="propertyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Liegenschaft *</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(parseInt(value))
                                        }
                                        value={field.value?.toString()}
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
                                    <FormDescription>
                                        Wähle die Liegenschaft für diese Versammlung
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Titel *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="z.B. Jahreshauptversammlung 2024"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Gib der Versammlung einen aussagekräftigen Titel
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Time */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Datum *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Startzeit *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Endzeit</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="locationName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Veranstaltungsort *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="z.B. Gemeindehaus, Raum 101"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Name des Veranstaltungsortes
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="locationAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Vollständige Adresse des Veranstaltungsortes"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional: Vollständige Adresse für die Einladung
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Invitation Deadline */}
                        <FormField
                            control={form.control}
                            name="invitationDeadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Einladungsfrist *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Bis wann müssen Einladungen verschickt werden
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                {/* Agenda Items Section */}
                {!isEditing && (
                    <div className="mt-6">
                        <AgendaItemsFormSection
                            value={agendaItems}
                            onChange={setAgendaItems}
                        />
                    </div>
                )}

                {/* Submit buttons */}
                <div className="flex gap-4 mt-6">
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting
                            ? "Wird gespeichert..."
                            : isEditing
                              ? "Änderungen speichern"
                              : "Versammlung erstellen"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Abbrechen
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
