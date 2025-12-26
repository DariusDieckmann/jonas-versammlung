"use client";

import { Download, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatFileSize } from "@/lib/file-validation";
import type { AgendaItemAttachment } from "../../shared/schemas/agenda-item-attachment.schema";

interface ConductAgendaItemAttachmentsDisplayProps {
    attachments: AgendaItemAttachment[];
}

export function ConductAgendaItemAttachmentsDisplay({
    attachments,
}: ConductAgendaItemAttachmentsDisplayProps) {
    if (attachments.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Dateien zu diesem TOP</CardTitle>
                <CardDescription className="text-xs">
                    {attachments.length} {attachments.length === 1 ? "Datei" : "Dateien"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {attachments.map((attachment) => (
                    <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {attachment.fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.fileSize)}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={attachment.r2Url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
