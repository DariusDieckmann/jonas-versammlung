import { type NextRequest, NextResponse } from "next/server";
import { MAX_FILES_PER_MEETING, validateFile } from "@/lib/file-validation";
import { uploadToR2 } from "@/lib/r2";
import { getMeetingPath } from "@/lib/r2-paths";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    createMeetingAttachment,
    getMeetingAttachments,
} from "@/modules/meetings/shared/meeting-attachment.action";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ meetingId: string }> },
) {
    try {
        await requireAuth();
        const { meetingId } = await params;
        const meetingIdNum = Number.parseInt(meetingId, 10);

        if (Number.isNaN(meetingIdNum)) {
            return NextResponse.json(
                { error: "Ungültige Versammlungs-ID" },
                { status: 400 },
            );
        }

        // Check if max files limit reached, we also chck here if the user is allowed to access data for this meeting
        const existingAttachments = await getMeetingAttachments(meetingIdNum);
        if (existingAttachments.length >= MAX_FILES_PER_MEETING) {
            return NextResponse.json(
                {
                    error: `Maximum ${MAX_FILES_PER_MEETING} Dateien pro Versammlung erlaubt`,
                },
                { status: 400 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Keine Datei hochgeladen" },
                { status: 400 },
            );
        }

        // Validate file (type and size)
        const validation = validateFile(file);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 },
            );
        }

        // Upload to R2
        const uploadResult = await uploadToR2(file, getMeetingPath(meetingIdNum));

        if (!uploadResult.success || !uploadResult.key || !uploadResult.url) {
            return NextResponse.json(
                { error: uploadResult.error || "Upload fehlgeschlagen" },
                { status: 500 },
            );
        }

        // Save to database
        const result = await createMeetingAttachment({
            meetingId: meetingIdNum,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            r2Key: uploadResult.key,
            r2Url: uploadResult.url,
            uploadedBy: "", // Will be set by the action from auth
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Fehler beim Speichern" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Fehler beim Hochladen der Datei" },
            { status: 500 },
        );
    }
}
