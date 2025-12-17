"use client";

import { Download, File, FileText} from "lucide-react";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/file-validation";
import type { AgendaItemAttachment } from "../../shared/schemas/agenda-item-attachment.schema";
import type { MeetingAttachment } from "../../shared/schemas/meeting-attachment.schema";

interface ConductFilesSidebarProps {
    meetingAttachments: MeetingAttachment[];
    agendaItemAttachments: Map<number, AgendaItemAttachment[]>;
    agendaItems: Array<{ id: number; title: string }>;
}

export function ConductFilesSidebar({
    meetingAttachments,
    agendaItemAttachments,
    agendaItems,
}: ConductFilesSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const totalFiles =
        meetingAttachments.length +
        Array.from(agendaItemAttachments.values()).reduce(
            (sum, arr) => sum + arr.length,
            0,
        );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Dateien ({totalFiles})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Dateien & Dokumente</DialogTitle>
                    <DialogDescription>
                        Alle hochgeladenen Dateien für diese Versammlung
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {/* Meeting Attachments */}
                    {meetingAttachments.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    Versammlungsdateien
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Allgemeine Dokumente (Einladungen,
                                    Protokolle, etc.)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {meetingAttachments.map((attachment) => (
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
                                                    {formatFileSize(
                                                        attachment.fileSize,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
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
                    )}

                    {/* Agenda Item Attachments */}
                    {agendaItems.map((item) => {
                        const attachments =
                            agendaItemAttachments.get(item.id) || [];
                        if (attachments.length === 0) return null;

                        return (
                            <Card key={item.id}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        {item.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Tagesordnungspunkt
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
                                                        {formatFileSize(
                                                            attachment.fileSize,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
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
                    })}

                    {totalFiles === 0 && (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <File className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500">
                                    Keine Dateien hochgeladen
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
