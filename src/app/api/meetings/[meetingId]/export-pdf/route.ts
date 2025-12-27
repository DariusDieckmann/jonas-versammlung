import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import puppeteer from "@cloudflare/puppeteer";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getAgendaItems } from "@/modules/meetings/shared/agenda-item.action";
import { getMeeting } from "@/modules/meetings/shared/meeting.action";
import { getMeetingLeaders } from "@/modules/meetings/shared/meeting-leader.action";
import { getMeetingParticipants } from "@/modules/meetings/shared/meeting-participant.action";
import { getResolutionsByAgendaItems } from "@/modules/meetings/shared/resolution.action";
import { MeetingStatus, MeetingStatusType } from "@/modules/meetings/shared/schemas/meeting.schema";
import { getProperty } from "@/modules/properties/shared/property.action";
import { generatePDFHtml } from "@/modules/meetings/features/pdf/meeting-pdf-generator";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ meetingId: string }> },
) {
    try {
        await requireAuth();

        const { meetingId: id } = await params;
        const meetingId = Number.parseInt(id);

        if (Number.isNaN(meetingId)) {
            return NextResponse.json(
                { error: "Invalid meeting ID" },
                { status: 400 },
            );
        }

        // Fetch meeting data
        const meeting = await getMeeting(meetingId);
        if (!meeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 },
            );
        }

        // Get property information
        const property = await getProperty(meeting.propertyId);
        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 },
            );
        }

        // Get agenda items
        const agendaItems = await getAgendaItems(meetingId);

        // Get resolutions for completed meetings
        let resolutions = new Map();
        if (meeting.status === MeetingStatus.COMPLETED) {
            const itemsWithResolutions = agendaItems.filter(
                (item) => item.requiresResolution,
            );
            resolutions = await getResolutionsByAgendaItems(
                itemsWithResolutions.map((item) => item.id),
            );
        }

        // Prepare agenda items with resolutions
        const agendaItemsWithResolutions = agendaItems.map((item) => ({
            ...item,
            resolution: resolutions.get(item.id),
        }));

        // Get leaders and participants
        const leaders = await getMeetingLeaders(meetingId);
        const participants = await getMeetingParticipants(meetingId);

        // Prepare meeting data with property info
        const meetingData = {
            ...meeting,
            propertyName: property.name,
            propertyAddress: `${property.address}, ${property.postalCode} ${property.city}`,
        };

        // Generate HTML
        const html = generatePDFHtml({
            meeting: meetingData,
            agendaItems: agendaItemsWithResolutions,
        });

        // Get the BROWSER binding from the Cloudflare environment
        const { env } = await getCloudflareContext();
        const browser = await puppeteer.launch(env.BROWSER);
        const page = await browser.newPage();

        // Load HTML content
        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        // Generate PDF
        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "2.5cm",
                right: "2cm",
                bottom: "3cm",
                left: "2cm",
            },
        });

        // Close browser
        await browser.close();

        // Generate filename
        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toISOString().split("T")[0];
        };

        const filename = `Protokoll_${property.name.replace(/[^a-zA-Z0-9]/g, "_")}_${formatDate(meeting.date)}.pdf`;

        // Return PDF as response
        return new NextResponse(Buffer.from(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 },
        );
    }
}
