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
    agendaItems?: AgendaItemFormData[];
    onAgendaItemsChange?: (items: AgendaItemFormData[]) => void;
    onSubmit?: (data: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

export function MeetingForm({
    properties,
    initialData,
    initialAgendaItems = [],
    agendaItems: externalAgendaItems,
    onAgendaItemsChange,
    onSubmit: externalOnSubmit,
    isSubmitting: externalIsSubmitting,
}: MeetingFormProps) {
    const router = useRouter();
    const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
    const [internalAgendaItems, setInternalAgendaItems] = useState<AgendaItemFormData[]>(
        initialAgendaItems.length > 0
            ? initialAgendaItems.map((item) => ({
                  title: item.title,
                  description: item.description || "",
                  requiresResolution: item.requiresResolution,
              }))
            : [{ title: "", description: "", requiresResolution: false }],
    );
    const isEditing = !!initialData;

    // Use external values if provided, otherwise use internal state
    const agendaItems = externalAgendaItems || internalAgendaItems;
    const setAgendaItems = onAgendaItemsChange || setInternalAgendaItems;
    const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

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
        if (externalOnSubmit) {
            await externalOnSubmit(data);
            return;
        }

        setInternalIsSubmitting(true);

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
            setInternalIsSubmitting(false);
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
            <CardHeader className="pb-0">
                <CardTitle className="text-xl">
                    {isEditing
                        ? "Versammlung bearbeiten"
                        : "Neue Versammlung"}
                </CardTitle>
                <CardDescription className="text-sm">
                    {isEditing
                        ? "Bearbeite die Details der Versammlung"
                        : "Erstelle eine neue Versammlung für eine Liegenschaft"}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Property Selection */}
                        <FormField
                            control={form.control}
                            name="propertyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Liegenschaft</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(parseInt(value))
                                        }
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-9">
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

                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Titel</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="z.B. Jahreshauptversammlung 2024"
                                            {...field}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Time */}
                        <div className="grid gap-3 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Datum</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="h-9" />
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
                                        <FormLabel className="text-sm">Beginn</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                className="h-9"
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
                                        <FormLabel className="text-sm">Ende</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                value={field.value || ""}
                                                className="h-9"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Location */}
                        <div className="grid gap-3 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="locationName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Veranstaltungsort</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="z.B. Gemeindehaus"
                                                {...field}
                                                className="h-9"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="locationAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Adresse</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Straße, PLZ Ort"
                                                {...field}
                                                value={field.value || ""}
                                                className="h-9"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Invitation Deadline */}
                        <FormField
                            control={form.control}
                            name="invitationDeadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Einladungsfrist</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
