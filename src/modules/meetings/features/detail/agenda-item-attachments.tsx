"use client";

import {
    AlertCircle,
    Download,
    File,
    Loader2,
    Paperclip,
    Trash2,
    Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    formatFileSize,
    getAcceptedFileTypes,
    MAX_FILES_PER_MEETING,
    validateFile,
} from "@/lib/file-validation";
import { deleteAgendaItemAttachment } from "../../shared/agenda-item-attachment.action";
import type { AgendaItemAttachment } from "../../shared/schemas/agenda-item-attachment.schema";
import toast from "react-hot-toast";

interface AgendaItemAttachmentsProps {
    agendaItemId: number;
    attachments: AgendaItemAttachment[];
    canEdit?: boolean;
}

export function AgendaItemAttachments({
    agendaItemId,
    attachments,
    canEdit = true,
}: AgendaItemAttachmentsProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const validation = validateFile(file);
        if (!validation.valid) {
            setUploadError(validation.error || "Ungültige Datei");
            e.target.value = "";
            return;
        }

        // Check max files limit
        if (attachments.length >= MAX_FILES_PER_MEETING) {
            setUploadError(
                `Maximum ${MAX_FILES_PER_MEETING} Dateien pro TOP erlaubt`,
            );
            e.target.value = "";
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `/api/agenda-items/${agendaItemId}/attachments`,
                {
                    method: "POST",
                    body: formData,
                },
            );

            const result = (await response.json()) as {
                success: boolean;
                error?: string;
            };

            if (!result.success) {
                setUploadError(result.error || "Upload fehlgeschlagen");
                return;
            }

            // Refresh page to show new file
            router.refresh();
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError("Fehler beim Hochladen der Datei");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleDelete = async (attachmentId: number) => {
        if (!confirm("Möchten Sie diese Datei wirklich löschen?")) {
            return;
        }

        const result = await deleteAgendaItemAttachment(attachmentId);
        if (result.success) {
            router.refresh();
        } else {
            toast.error(result.error || "Fehler beim Löschen");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center jajustify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span>Dateien ({attachments.length})</span>
                </div>
                {canEdit && (
                    <label htmlFor={`file-upload-${agendaItemId}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                                isUploading ||
                                attachments.length >= MAX_FILES_PER_MEETING
                            }
                            asChild
                        >
                            <span className="cursor-pointer">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Lädt...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-3 w-3 mr-1" />
                                        Hochladen
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                )}
            </div>

            <input
                id={`file-upload-${agendaItemId}`}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={
                    isUploading ||
                    attachments.length >= MAX_FILES_PER_MEETING ||
                    !canEdit
                }
                accept={getAcceptedFileTypes()}
            />

            {uploadError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{uploadError}</p>
                </div>
            )}

            {attachments.length > 0 && (
                <div className="space-y-1">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 text-xs"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <File className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">
                                        {attachment.fileName}
                                    </p>
                                    <p className="text-gray-500">
                                        {formatFileSize(attachment.fileSize)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    asChild
                                >
                                    <a
                                        href={attachment.r2Url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Download className="h-3 w-3" />
                                    </a>
                                </Button>
                                {canEdit && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                            handleDelete(attachment.id)
                                        }
                                    >
                                        <Trash2 className="h-3 w-3 text-red-600" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
