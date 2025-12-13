import { type NextRequest, NextResponse } from "next/server";
import { MAX_FILES_PER_MEETING, validateFile } from "@/lib/file-validation";
import { uploadToR2 } from "@/lib/r2";
import { getAgendaItemPath } from "@/lib/r2-paths";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    createAgendaItemAttachment,
    getAgendaItemAttachments,
} from "@/modules/meetings/shared/agenda-item-attachment.action";
import { getAgendaItem } from "@/modules/meetings/shared/agenda-item.action";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ agendaItemId: string }> },
) {
    try {
        await requireAuth();
        const { agendaItemId } = await params;
        const agendaItemIdNum = Number.parseInt(agendaItemId, 10);

        if (Number.isNaN(agendaItemIdNum)) {
            return NextResponse.json(
                { error: "Ungültige Tagesordnungspunkt-ID" },
                { status: 400 },
            );
        }

        // Check access and get agenda item data early (fail fast on unauthorized requests)
        const agendaItemData = await getAgendaItem(agendaItemIdNum);
        if (!agendaItemData) {
            return NextResponse.json(
                { error: "Tagesordnungspunkt nicht gefunden" },
                { status: 404 },
            );
        }

        // Check if max files limit reached
        const existingAttachments =
            await getAgendaItemAttachments(agendaItemIdNum);
        if (existingAttachments.length >= MAX_FILES_PER_MEETING) {
            return NextResponse.json(
                {
                    error: `Maximum ${MAX_FILES_PER_MEETING} Dateien pro Tagesordnungspunkt erlaubt`,
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

        // Upload to R2 with hierarchical structure
        const uploadResult = await uploadToR2(
            file,
            getAgendaItemPath(agendaItemData.meetingId, agendaItemIdNum),
        );

        if (!uploadResult.success || !uploadResult.key || !uploadResult.url) {
            return NextResponse.json(
                { error: uploadResult.error || "Upload fehlgeschlagen" },
                { status: 500 },
            );
        }

        // Save to database
        const result = await createAgendaItemAttachment({
            agendaItemId: agendaItemIdNum,
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
