"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MeetingForm } from "../../shared/components/meeting-form";
import { AgendaItemsFormSection, type AgendaItemFormData } from "../../shared/components/agenda-items-form-section";
import type { Property } from "@/modules/properties/shared/schemas/property.schema";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import { Button } from "@/components/ui/button";
import { createMeeting, updateMeeting } from "../meeting.action";
import { createAgendaItems, updateAgendaItem, deleteAgendaItem, createAgendaItem } from "../agenda-item.action";
import meetingsRoutes from "@/modules/meetings/meetings.route";

interface MeetingFormWithAgendaProps {
    properties: Property[];
    initialData?: Meeting;
    initialAgendaItems?: AgendaItem[];
}

export function MeetingFormWithAgenda({
    properties,
    initialData,
    initialAgendaItems = [],
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
        initialAgendaItems.map((item) => item.id)
    );

    const isEditing = !!initialData;

    const handleSubmit = async (data: any) => {
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
                    (item) => item.title.trim() !== ""
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
                agendaItems={agendaItems}
                onAgendaItemsChange={setAgendaItems}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* Agenda Items Section - Separate Card */}
            <AgendaItemsFormSection
                value={agendaItems}
                onChange={setAgendaItems}
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
