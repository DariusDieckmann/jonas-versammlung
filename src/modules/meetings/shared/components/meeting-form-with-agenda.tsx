"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import meetingsRoutes from "@/modules/meetings/shared/meetings.route";
import type { Property } from "@/modules/properties/shared/schemas/property.schema";
import {
    type AgendaItemFormData,
    AgendaItemsFormSection,
} from "../../shared/components/agenda-items-form-section";
import { MeetingForm } from "../../shared/components/meeting-form";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { AgendaItemTemplate } from "../../shared/schemas/agenda-item-template.schema";
import type {
    insertMeetingSchema,
    Meeting,
} from "../../shared/schemas/meeting.schema";
import {
    createAgendaItem,
    createAgendaItems,
    deleteAgendaItem,
    updateAgendaItem,
} from "../agenda-item.action";
import { createMeeting, updateMeeting } from "../meeting.action";

interface MeetingFormWithAgendaProps {
    properties: Property[];
    initialData?: Meeting;
    initialAgendaItems?: AgendaItem[];
    templates?: AgendaItemTemplate[];
}

export function MeetingFormWithAgenda({
    properties,
    initialData,
    initialAgendaItems = [],
    templates = [],
}: MeetingFormWithAgendaProps) {
    const router = useRouter();
    const [agendaItems, setAgendaItems] = useState<AgendaItemFormData[]>(
        initialAgendaItems.length > 0
            ? initialAgendaItems.map((item) => ({
                  title: item.title,
                  description: item.description || "",
                  requiresResolution: item.requiresResolution,
              }))
            : [{ title: "", description: "", requiresResolution: false }],
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialAgendaItemsIds] = useState<number[]>(
        initialAgendaItems.map((item) => item.id),
    );

    const isEditing = !!initialData;

    const handleSubmit = async (data: z.infer<typeof insertMeetingSchema>) => {
        setIsSubmitting(true);

        try {
            if (isEditing && initialData) {
                // Update meeting
                const result = await updateMeeting(initialData.id, data);
                if (!result.success) {
                    alert(result.error || "Fehler beim Aktualisieren");
                    return;
                }

                // Update agenda items
                const validAgendaItems = agendaItems.filter(
                    (item) => item.title.trim() !== "",
                );

                // Update or create each agenda item
                for (let i = 0; i < validAgendaItems.length; i++) {
                    const item = validAgendaItems[i];
                    const existingId = initialAgendaItemsIds[i];

                    if (existingId) {
                        // Update existing item
                        await updateAgendaItem(existingId, {
                            ...item,
                            orderIndex: i,
                        });
                    } else {
                        // Create new item
                        await createAgendaItem({
                            meetingId: initialData.id,
                            ...item,
                            orderIndex: i,
                        });
                    }
                }

                // Delete removed items (if there were more initially)
                if (initialAgendaItemsIds.length > validAgendaItems.length) {
                    for (
                        let i = validAgendaItems.length;
                        i < initialAgendaItemsIds.length;
                        i++
                    ) {
                        const idToDelete = initialAgendaItemsIds[i];
                        if (idToDelete) {
                            await deleteAgendaItem(idToDelete);
                        }
                    }
                }

                router.push(meetingsRoutes.detail(initialData.id));
                router.refresh();
            } else {
                const result = await createMeeting(data);
                if (result.success && result.meetingId) {
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
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="space-y-4">
            <MeetingForm
                properties={properties}
                initialData={initialData}
                initialAgendaItems={initialAgendaItems}
                onSubmit={handleSubmit}
            />

            {/* Agenda Items Section - Separate Card */}
            <AgendaItemsFormSection
                value={agendaItems}
                onChange={setAgendaItems}
                templates={templates}
            />

            {/* Action Buttons - Below all cards */}
            <div className="flex justify-end gap-4 pb-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                >
                    Abbrechen
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                        // Trigger form submission
                        const form = document.querySelector("form");
                        if (form) {
                            form.requestSubmit();
                        }
                    }}
                >
                    {isSubmitting
                        ? "Wird gespeichert..."
                        : isEditing
                          ? "Versammlung aktualisieren"
                          : "Versammlung erstellen"}
                </Button>
            </div>
        </div>
    );
}
