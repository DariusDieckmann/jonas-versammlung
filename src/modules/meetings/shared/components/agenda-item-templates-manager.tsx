"use client";

import { CheckCircle2, Edit, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholderPicker } from "@/components/ui/placeholder-picker";
import { Textarea } from "@/components/ui/textarea";
import {
    createAgendaItemTemplate,
    deleteAgendaItemTemplate,
    updateAgendaItemTemplate,
} from "../agenda-item-template.action";
import { MajorityType } from "../schemas/agenda-item.schema";
import type { AgendaItemTemplate } from "../schemas/agenda-item-template.schema";

interface AgendaItemTemplatesManagerProps {
    organizationId: number;
    templates: AgendaItemTemplate[];
    onTemplatesChange: () => void;
}

export function AgendaItemTemplatesManager({
    organizationId,
    templates,
    onTemplatesChange,
}: AgendaItemTemplatesManagerProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] =
        useState<AgendaItemTemplate | null>(null);

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        requiresResolution: boolean;
        majorityType: typeof MajorityType[keyof typeof MajorityType] | null;
    }>({
        title: "",
        description: "",
        requiresResolution: false,
        majorityType: null,
    });

    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            requiresResolution: false,
            majorityType: null,
        });
    };

    const handleCreate = async () => {
        if (!formData.title.trim()) {
            toast.error("Bitte geben Sie einen Titel ein");
            return;
        }

        const result = await createAgendaItemTemplate({
            organizationId,
            ...formData,
        });

        if (result.success) {
            toast.success("Vorlage erstellt");
            setIsCreateOpen(false);
            resetForm();
            onTemplatesChange();
        } else {
            toast.error(result.error || "Fehler beim Erstellen");
        }
    };

    const handleEdit = async () => {
        if (!editingTemplate || !formData.title.trim()) {
            toast.error("Bitte geben Sie einen Titel ein");
            return;
        }

        const result = await updateAgendaItemTemplate(editingTemplate.id, {
            ...formData,
        });

        if (result.success) {
            toast.success("Vorlage aktualisiert");
            setIsEditOpen(false);
            setEditingTemplate(null);
            resetForm();
            onTemplatesChange();
        } else {
            toast.error(result.error || "Fehler beim Aktualisieren");
        }
    };

    const handleDelete = async (templateId: number) => {
        if (!confirm("Möchten Sie diese Vorlage wirklich löschen?")) {
            return;
        }

        const result = await deleteAgendaItemTemplate(templateId);

        if (result.success) {
            toast.success("Vorlage gelöscht");
            onTemplatesChange();
        } else {
            toast.error(result.error || "Fehler beim Löschen");
        }
    };

    const openEdit = (template: AgendaItemTemplate) => {
        setEditingTemplate(template);
        setFormData({
            title: template.title,
            description: template.description || "",
            requiresResolution: template.requiresResolution,
            majorityType: template.majorityType || null,
        });
        setIsEditOpen(true);
    };

    const insertPlaceholder = (placeholder: string) => {
        const textarea = descriptionRef.current;
        if (textarea) {
            const start = textarea.selectionStart || 0;
            const end = textarea.selectionEnd || 0;
            const currentValue = formData.description;
            const newValue =
                currentValue.substring(0, start) +
                placeholder +
                currentValue.substring(end);
            setFormData({ ...formData, description: newValue });
            // Set focus back and move cursor
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                    start + placeholder.length,
                    start + placeholder.length,
                );
            }, 0);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>TOP-Vorlagen</CardTitle>
                            <CardDescription>
                                Vorlagen für Tagesordnungspunkte verwalten
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Vorlage erstellen
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {templates.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            Noch keine Vorlagen vorhanden
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold">
                                                {template.title}
                                            </h4>
                                            {template.requiresResolution && (
                                                <Badge variant="outline">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Beschluss
                                                </Badge>
                                            )}
                                            {template.majorityType && (
                                                <Badge variant="secondary">
                                                    {template.majorityType === "qualified" ? "75%" : "50%"}
                                                </Badge>
                                            )}
                                        </div>
                                        {template.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {template.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEdit(template)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(template.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Neue Vorlage erstellen</DialogTitle>
                        <DialogDescription>
                            Erstellen Sie eine Vorlage für Tagesordnungspunkte
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="create-title">Titel</Label>
                            <Input
                                id="create-title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="z.B. Genehmigung des Protokolls"
                            />
                        </div>
                        <div>
                            <Label htmlFor="create-description">
                                Beschreibung (optional)
                            </Label>
                            <div className="space-y-2">
                                <Textarea
                                    id="create-description"
                                    ref={descriptionRef}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Zusätzliche Details..."
                                    rows={4}
                                />
                                <PlaceholderPicker
                                    onSelect={insertPlaceholder}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Beschlussfassung
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="create-resolution-simple"
                                    checked={formData.majorityType === MajorityType.SIMPLE}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            requiresResolution: checked === true,
                                            majorityType: checked === true ? MajorityType.SIMPLE : null,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="create-resolution-simple"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Erfordert 50% Mehrheit
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="create-resolution-qualified"
                                    checked={formData.majorityType === "qualified"}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            requiresResolution: checked === true,
                                            majorityType: checked === true ? "qualified" : null,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="create-resolution-qualified"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Erfordert 75% Mehrheit
                                </Label>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    resetForm();
                                }}
                            >
                                Abbrechen
                            </Button>
                            <Button onClick={handleCreate}>Erstellen</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Vorlage bearbeiten</DialogTitle>
                        <DialogDescription>
                            Bearbeiten Sie die Vorlage für Tagesordnungspunkte
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Titel</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="z.B. Genehmigung des Protokolls"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">
                                Beschreibung (optional)
                            </Label>
                            <div className="space-y-2">
                                <Textarea
                                    id="edit-description"
                                    ref={descriptionRef}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Zusätzliche Details..."
                                    rows={4}
                                />
                                <PlaceholderPicker
                                    onSelect={insertPlaceholder}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Beschlussfassung
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-resolution-simple"
                                    checked={formData.majorityType === MajorityType.SIMPLE}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            requiresResolution: checked === true,
                                            majorityType: checked === true ? MajorityType.SIMPLE : null,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="edit-resolution-simple"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Erfordert 50% Mehrheit
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-resolution-qualified"
                                    checked={formData.majorityType === MajorityType.QUALIFIED}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            requiresResolution: checked === true,
                                            majorityType: checked === true ? MajorityType.QUALIFIED : null,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="edit-resolution-qualified"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Erfordert 75% Mehrheit
                                </Label>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditingTemplate(null);
                                    resetForm();
                                }}
                            >
                                Abbrechen
                            </Button>
                            <Button onClick={handleEdit}>Speichern</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
