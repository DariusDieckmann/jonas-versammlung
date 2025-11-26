"use client";

import { MeetingAttachments } from "./meeting-attachments";
import type { MeetingAttachment } from "../../shared/schemas/meeting-attachment.schema";

interface MeetingAttachmentsSectionProps {
    meetingId: number;
    attachments: MeetingAttachment[];
    canEdit: boolean;
}

export function MeetingAttachmentsSection({
    meetingId,
    attachments,
    canEdit,
}: MeetingAttachmentsSectionProps) {
    return (
        <MeetingAttachments
            meetingId={meetingId}
            attachments={attachments}
            canEdit={canEdit}
        />
    );
}
