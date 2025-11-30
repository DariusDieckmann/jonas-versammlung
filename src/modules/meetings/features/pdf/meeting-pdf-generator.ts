import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { Meeting } from "../../shared/schemas/meeting.schema";

interface PDFData {
    meeting: Meeting & {
        propertyName: string;
        propertyAddress: string;
    };
    agendaItems: Array<
        AgendaItem & {
            resolution?: {
                votesYes: number;
                votesNo: number;
                votesAbstain: number;
                yesShares?: number;
                noShares?: number;
                abstainShares?: number;
                result: "accepted" | "rejected" | "deferred";
            };
        }
    >;
    leaders: Array<{ name: string; role: string }>;
    participants: Array<{ name: string; shares?: number }>;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatTime = (timeStr: string) => {
    return timeStr;
};

const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const escapeHtml = (text: string) => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export function generatePDFHtml(data: PDFData): string {
    const { meeting, agendaItems, leaders, participants } = data;

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <title>Protokoll - ${escapeHtml(meeting.title)} - ${formatDate(meeting.date)}</title>
    <style>
        @page {
            size: A4;
            margin: 2.5cm 2cm 3cm 2cm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
        }

        .page {
            position: relative;
            page-break-after: always;
        }

        .page:last-child {
            page-break-after: auto;
        }

        /* Briefkopf */
        .header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2563eb;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 10px;
        }

        .company-info {
            flex: 1;
        }

        .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 9pt;
            color: #666;
            line-height: 1.4;
        }

        .document-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin-top: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Hauptinhalt */
        .content {
            margin-bottom: 30px;
        }

        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 13pt;
            font-weight: bold;
            margin-bottom: 12px;
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }

        .info-item {
            margin-bottom: 8px;
        }

        .info-label {
            font-weight: bold;
            font-size: 10pt;
            color: #666;
            margin-bottom: 3px;
        }

        .info-value {
            font-size: 11pt;
            color: #000;
        }

        /* Tagesordnung */
        .agenda-item {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            page-break-inside: avoid;
        }

        .agenda-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .agenda-number {
            font-weight: bold;
            color: #666;
            margin-right: 15px;
            min-width: 60px;
        }

        .agenda-title {
            font-weight: bold;
            font-size: 12pt;
            flex: 1;
        }

        .agenda-badge {
            display: inline-block;
            padding: 3px 10px;
            border: 1px solid #2563eb;
            border-radius: 12px;
            font-size: 9pt;
            color: #2563eb;
            margin-left: 10px;
        }

        .agenda-description {
            margin: 10px 0 10px 75px;
            color: #444;
            white-space: pre-wrap;
        }

        /* Abstimmungsergebnisse */
        .resolution {
            margin-top: 15px;
            margin-left: 75px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 4px;
        }

        .resolution-title {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 10px;
        }

        .votes-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 10px;
        }

        .vote-box {
            text-align: center;
            padding: 10px;
            border-radius: 4px;
        }

        .vote-box.yes {
            background: #dcfce7;
            border: 1px solid #86efac;
        }

        .vote-box.no {
            background: #fee2e2;
            border: 1px solid #fca5a5;
        }

        .vote-box.abstain {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
        }

        .vote-count {
            font-size: 20pt;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .vote-count.yes { color: #16a34a; }
        .vote-count.no { color: #dc2626; }
        .vote-count.abstain { color: #6b7280; }

        .vote-label {
            font-size: 9pt;
            color: #666;
        }

        .vote-shares {
            font-size: 9pt;
            font-weight: bold;
            margin-top: 3px;
        }

        .vote-shares.yes { color: #15803d; }
        .vote-shares.no { color: #b91c1c; }
        .vote-shares.abstain { color: #4b5563; }

        .resolution-result {
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
        }

        .resolution-result.accepted {
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
        }

        .resolution-result.rejected {
            background: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
        }

        .resolution-result.deferred {
            background: #f3f4f6;
            color: #4b5563;
            border: 1px solid #d1d5db;
        }

        /* Teilnehmer */
        .participants-list {
            list-style: none;
            padding: 0;
        }

        .participant-item {
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            justify-content: space-between;
        }

        .participant-name {
            font-weight: 500;
        }

        .participant-shares {
            color: #666;
            font-size: 10pt;
        }

        /* Fußzeile */
        .footer {
            position: fixed;
            bottom: 1cm;
            left: 2cm;
            right: 2cm;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 9pt;
            color: #666;
            display: flex;
            justify-content: space-between;
        }

        .signature-section {
            margin-top: 50px;
            page-break-inside: avoid;
        }

        .signature-boxes {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }

        .signature-box {
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 10px;
            font-size: 10pt;
        }

        .signature-label {
            font-weight: bold;
        }

        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Briefkopf -->
        <div class="header">
            <div class="header-top">
                <div class="company-info">
                    <div class="company-name">
                        Hausverwaltung Schmidt & Partner
                    </div>
                    <div class="company-details">
                        Musterstraße 123 • 12345 Musterstadt<br />
                        Tel: +49 (0) 123 456789 • Fax: +49 (0) 123 456780<br />
                        Email: info@hausverwaltung-schmidt.de • www.hausverwaltung-schmidt.de
                    </div>
                </div>
            </div>
            <div class="document-title">
                Protokoll der Eigentümerversammlung
            </div>
        </div>

        <!-- Versammlungsdetails -->
        <div class="content">
            <div class="section">
                <h2 class="section-title">Versammlungsdetails</h2>
                <div class="info-item">
                    <div class="info-label">Titel</div>
                    <div class="info-value">${escapeHtml(meeting.title)}</div>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Objekt</div>
                        <div class="info-value">
                            ${escapeHtml(meeting.propertyName)}<br />
                            ${escapeHtml(meeting.propertyAddress)}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Datum</div>
                        <div class="info-value">${formatDate(meeting.date)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Uhrzeit</div>
                        <div class="info-value">
                            ${formatTime(meeting.startTime)}${meeting.endTime ? ` - ${formatTime(meeting.endTime)}` : ""}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Ort</div>
                        <div class="info-value">
                            ${escapeHtml(meeting.locationName)}${meeting.locationAddress ? `<br />${escapeHtml(meeting.locationAddress)}` : ""}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Versammlungsleitung -->
            ${
                leaders.length > 0
                    ? `
            <div class="section">
                <h2 class="section-title">Versammlungsleitung</h2>
                <ul class="participants-list">
                    ${leaders
                        .map(
                            (leader) => `
                    <li class="participant-item">
                        <span class="participant-name">${escapeHtml(leader.name)}</span>
                        <span class="participant-shares">${escapeHtml(leader.role)}</span>
                    </li>`,
                        )
                        .join("")}
                </ul>
            </div>`
                    : ""
            }

            <!-- Teilnehmer -->
            ${
                participants.length > 0
                    ? `
            <div class="section">
                <h2 class="section-title">Anwesende Eigentümer (${participants.length})</h2>
                <ul class="participants-list">
                    ${participants
                        .map(
                            (participant) => `
                    <li class="participant-item">
                        <span class="participant-name">${escapeHtml(participant.name)}</span>
                        ${participant.shares ? `<span class="participant-shares">${participant.shares} MEA</span>` : ""}
                    </li>`,
                        )
                        .join("")}
                </ul>
            </div>`
                    : ""
            }

            <!-- Tagesordnung -->
            ${
                agendaItems.length > 0
                    ? `
            <div class="section">
                <h2 class="section-title">Tagesordnung</h2>
                ${agendaItems
                    .map(
                        (item, index) => `
                <div class="agenda-item">
                    <div class="agenda-header">
                        <span class="agenda-number">TOP ${index + 1}</span>
                        <span class="agenda-title">${escapeHtml(item.title)}</span>
                        ${item.requiresResolution ? '<span class="agenda-badge">Beschluss</span>' : ""}
                    </div>
                    ${item.description ? `<div class="agenda-description">${escapeHtml(item.description)}</div>` : ""}

                    ${
                        item.resolution
                            ? `
                    <div class="resolution">
                        <div class="resolution-title">Abstimmungsergebnis</div>
                        <div class="votes-grid">
                            <div class="vote-box yes">
                                <div class="vote-count yes">${item.resolution.votesYes}</div>
                                <div class="vote-label">Ja-Stimmen</div>
                                ${item.resolution.yesShares ? `<div class="vote-shares yes">${item.resolution.yesShares} MEA</div>` : ""}
                            </div>
                            <div class="vote-box no">
                                <div class="vote-count no">${item.resolution.votesNo}</div>
                                <div class="vote-label">Nein-Stimmen</div>
                                ${item.resolution.noShares ? `<div class="vote-shares no">${item.resolution.noShares} MEA</div>` : ""}
                            </div>
                            <div class="vote-box abstain">
                                <div class="vote-count abstain">${item.resolution.votesAbstain}</div>
                                <div class="vote-label">Enthaltungen</div>
                                ${item.resolution.abstainShares ? `<div class="vote-shares abstain">${item.resolution.abstainShares} MEA</div>` : ""}
                            </div>
                        </div>
                        <div class="resolution-result ${item.resolution.result}">
                            ${
                                item.resolution.result === "accepted"
                                    ? "✓ ANGENOMMEN"
                                    : item.resolution.result === "rejected"
                                      ? "✗ ABGELEHNT"
                                      : "◯ VERSCHOBEN"
                            }
                        </div>
                    </div>`
                            : ""
                    }
                </div>`,
                    )
                    .join("")}
            </div>`
                    : ""
            }

            <!-- Unterschriften -->
            <div class="signature-section">
                <h2 class="section-title">Unterschriften</h2>
                <div class="signature-boxes">
                    <div class="signature-box">
                        <div class="signature-line">
                            <div class="signature-label">Versammlungsleiter/in</div>
                            ${leaders.length > 0 ? `<div style="margin-top: 5px">${escapeHtml(leaders[0].name)}</div>` : ""}
                        </div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">
                            <div class="signature-label">Protokollführer/in</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Fußzeile -->
        <div class="footer">
            <div>Protokoll erstellt am: ${formatDateTime(meeting.updatedAt)}</div>
            <div>${escapeHtml(meeting.propertyName)} • ${escapeHtml(meeting.title)}</div>
        </div>
    </div>
</body>
</html>`;
}
