"use client";

import {
    AlertCircle,
    Download,
    File,
    Loader2,
    Trash2,
    Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    formatFileSize,
    getAcceptedFileTypes,
    MAX_FILE_SIZE,
    MAX_FILES_PER_MEETING,
    validateFile,
} from "@/lib/file-validation";
import { deleteMeetingAttachment } from "../../shared/meeting-attachment.action";
import type { MeetingAttachment } from "../../shared/schemas/meeting-attachment.schema";
import toast from "react-hot-toast";

interface MeetingAttachmentsProps {
    meetingId: number;
    attachments: MeetingAttachment[];
    canEdit?: boolean;
}

export function MeetingAttachments({
    meetingId,
    attachments,
    canEdit = true,
}: MeetingAttachmentsProps) {
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
            e.target.value = ""; // Reset input
            return;
        }

        // Check max files limit
        if (attachments.length >= MAX_FILES_PER_MEETING) {
            setUploadError(
                `Maximum ${MAX_FILES_PER_MEETING} Dateien pro Versammlung erlaubt`,
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
                `/api/meetings/${meetingId}/attachments`,
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
            // Reset input
            e.target.value = "";
        }
    };

    const handleDelete = async (attachmentId: number) => {
        if (!confirm("Möchten Sie diese Datei wirklich löschen?")) {
            return;
        }

        const result = await deleteMeetingAttachment(attachmentId);
        if (result.success) {
            router.refresh();
        } else {
            toast.error(result.error || "Fehler beim Löschen");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dateien</CardTitle>
                <CardDescription>
                    Einladungen, Protokolle und weitere Dokumente
                    <br />
                    <span className="text-xs text-gray-500">
                        Erlaubte Formate: PDF, Word, Excel, PowerPoint, Bilder,
                        TXT, CSV • Max. {formatFileSize(MAX_FILE_SIZE)} • Max.{" "}
                        {MAX_FILES_PER_MEETING} Dateien
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {canEdit && (
                    <div className="mb-4">
                        <label htmlFor="file-upload">
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={
                                    isUploading ||
                                    attachments.length >= MAX_FILES_PER_MEETING
                                }
                                asChild
                            >
                                <span className="cursor-pointer">
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Wird hochgeladen...
                                        </>
                                    ) : attachments.length >=
                                      MAX_FILES_PER_MEETING ? (
                                        <>
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Maximum erreicht (
                                            {MAX_FILES_PER_MEETING} Dateien)
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Datei hochladen
                                        </>
                                    )}
                                </span>
                            </Button>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={
                                isUploading ||
                                attachments.length >= MAX_FILES_PER_MEETING
                            }
                            accept={getAcceptedFileTypes()}
                        />
                        {uploadError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-600">
                                    {uploadError}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {attachments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Noch keine Dateien hochgeladen
                    </p>
                ) : (
                    <div className="space-y-2">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">
                                            {attachment.fileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(
                                                attachment.fileSize,
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <a
                                            href={attachment.r2Url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    {canEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(attachment.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
