import type { AgendaItem } from "../../shared/schemas/agenda-item.schema";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import { ResolutionResult, type Resolution } from "../../shared/schemas/resolution.schema";

interface PDFData {
    meeting: Meeting & {
        propertyName: string;
        propertyAddress: string;
    };
    agendaItems: Array<
        AgendaItem & {
            resolution?: Resolution;
        }
    >;
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

const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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

const formatResolutionText = (resolution: Resolution): string => {
    const yesSharesNum = resolution.yesShares ? Number.parseFloat(resolution.yesShares) : null;
    const noSharesNum = resolution.noShares ? Number.parseFloat(resolution.noShares) : null;
    const abstainSharesNum = resolution.abstainShares ? Number.parseFloat(resolution.abstainShares) : null;

    const yesText = `${resolution.votesYes} Ja-Stimmen${yesSharesNum ? ` (${yesSharesNum} MEA)` : ""}`;
    const noText = `${resolution.votesNo} Nein-Stimmen${noSharesNum ? ` (${noSharesNum} MEA)` : ""}`;
    const abstainText = `${resolution.votesAbstain} Enthaltungen${abstainSharesNum ? ` (${abstainSharesNum} MEA)` : ""}`;
    
    const isUnanimousAccepted = resolution.votesNo === 0 && resolution.votesAbstain === 0;
    const isUnanimousRejected = resolution.votesYes === 0 && resolution.votesAbstain === 0;

    if (resolution.result === ResolutionResult.ACCEPTED) {
        return `Dieser Antrag wird mit ${yesText}, ${noText} und ${abstainText} ${isUnanimousAccepted ? "einstimmig " : ""}angenommen.`;
    }
    
    if (resolution.result === ResolutionResult.REJECTED) {
        return `Dieser Antrag wird mit ${yesText}, ${noText} und ${abstainText} ${isUnanimousRejected ? "einstimmig " : ""}abgelehnt.`;
    }
    
    return `Dieser Antrag wird mit ${yesText}, ${noText} und ${abstainText} vertagt.`;
};

export function generatePDFHtml(data: PDFData): string {
    const { meeting, agendaItems} = data;

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <title>Beschluss-Protokoll - ${escapeHtml(meeting.title)}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000;
        }

        .page {
            position: relative;
        }

        /* Kopfzeile */
        .header-recipient {
            margin-bottom: 5px;
            line-height: 1.3;
        }

        .header-date {
            text-align: right;
            margin-bottom: 30px;
            margin-top: 10px;
        }

        /* Zusammenfassung der TOPs */
        .agenda-summary {
            margin-bottom: 30px;
        }

        .agenda-summary-item {
            margin-bottom: 2px;
        }

        /* Titel */
        .document-title {
            font-weight: bold;
            margin-bottom: 5px;
            text-align: center;
            text-decoration: underline;
        }

        .document-subtitle {
            margin-bottom: 3px;
        }

        .document-meeting-info {
            margin-bottom: 20px;
        }

        /* Tagesordnung Überschrift */
        .agenda-header {
            margin-top: 20px;
            margin-bottom: 10px;
        }

        /* TOPs im Detail */
        .top-section {
            margin-top: 35px;
            margin-bottom: 35px;
            page-break-inside: avoid;
        }

        .top-title {
            font-weight: bold;
            margin-bottom: 10px;
        }

        .top-content {
            margin-bottom: 10px;
            white-space: pre-wrap;
        }

        .top-antrag {
            margin-top: 10px;
            margin-bottom: 5px;
        }

        .top-abstimmung {
            margin-top: 10px;
            margin-bottom: 5px;
        }

        .vote-line {
            margin-bottom: 2px;
        }

        .top-beschluss {
            margin-top: 10px;
        }

        /* Versammlungsende */
        .meeting-end {
            margin-top: 50px;
            margin-bottom: 40px;
        }

        /* Unterschriften */
        .signatures {
            margin-top: 60px;
        }

        .signature-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }

        .signature-box {
            width: 48%;
        }

        .signature-location {
            margin-bottom: 30px;
        }

        .signature-line {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 50px;
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
        <!-- Kopfzeile linksbündig -->
        <div class="header-recipient">
            An sämtliche<br />
            Eigentümer der WEG<br />
            ${escapeHtml(meeting.propertyName)}<br />
            ${escapeHtml(meeting.propertyAddress)}
        </div>

        <!-- Datum rechtsbündig -->
        <div class="header-date">
            ${getTodayFormatted()}
        </div>

        <!-- Titel -->
        <div class="document-title">
            Beschluss-Protokoll
        </div>
        <div class="document-subtitle">
            über die Eigentümerversammlung der Wohnungseigentümergemeinschaft ${escapeHtml(meeting.propertyName)}
            am ${formatDate(meeting.date)} im ${escapeHtml(meeting.locationName)}
        </div>

        <!-- Tagesordnung Header -->
        <div class="agenda-header">
            Die Tagungsordnung lautet wie folgt:
        </div>
        ${agendaItems
            .map(
                (item, index) =>
                    `<div class="agenda-summary-item">${index + 1}. ${escapeHtml(item.title)}</div>`,
            )
            .join("")}

        <!-- TOPs im Detail -->
        ${agendaItems
            .map(
                (item, index) => `
        <div class="top-section">
            <div class="top-title">Zu TOP ${index + 1}: ${escapeHtml(item.title)}</div>
            ${
                item.description
                    ? `<div class="top-content">${escapeHtml(item.description)}</div>`
                    : ""
            }
            ${
                item.requiresResolution && item.resolution
                    ? `
            <div class="top-antrag">
                <strong>Antrag:</strong><br />
                ${item.description ? escapeHtml(item.description) : ""}
            </div>
            <div class="top-abstimmung">
                <strong>Abstimmung:</strong><br />
                <div class="vote-line">Ja-Stimmen ${item.resolution.votesYes}${item.resolution.yesShares ? ` (${item.resolution.yesShares} MEA)` : ""}</div>
                <div class="vote-line">Nein-Stimmen ${item.resolution.votesNo}${item.resolution.noShares ? ` (${item.resolution.noShares} MEA)` : ""}</div>
                <div class="vote-line">Enthaltungen ${item.resolution.votesAbstain}${item.resolution.abstainShares ? ` (${item.resolution.abstainShares} MEA)` : ""}</div>
            </div>
            <div class="top-beschluss">
                <strong>Beschluss:</strong><br />
                ${formatResolutionText(item.resolution)}
            </div>`
                    : ""
            }
        </div>`,
            )
            .join("")}

        <!-- Versammlungsende -->
        <div class="meeting-end">
            Nachdem keine Wortmeldungen mehr vorliegen, endet die Versammlung um ${escapeHtml(meeting.endTime || "__:__")} Uhr.
        </div>

        <!-- Unterschriften -->
        <div class="signatures">
            <div class="signature-row">
                <div class="signature-box">
                    <div class="signature-location">${escapeHtml(meeting.locationName)}, den ....................</div>
                    <div class="signature-line">
                        Verwalter / Versammlungsleiter
                    </div>
                </div>
                <div class="signature-box">
                    <div class="signature-location">${escapeHtml(meeting.locationName)}, den ....................</div>
                    <div class="signature-line">
                        Verwaltungsbeirat
                    </div>
                </div>
            </div>
            <div class="signature-row">
                <div class="signature-box">
                    <div class="signature-location">${escapeHtml(meeting.locationName)}, den ....................</div>
                    <div class="signature-line">
                        Wohnungseigentümer
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
