import type { Meeting } from "@/modules/meetings/shared/schemas/meeting.schema";

export interface PlaceholderOption {
    label: string;
    value: string;
    description: string;
    category: string;
}

/**
 * Available placeholders for meeting data
 */
export const MEETING_PLACEHOLDERS: PlaceholderOption[] = [
    {
        label: "Titel der Versammlung",
        value: "{{meeting.title}}",
        description: "Der vollständige Titel der Versammlung",
        category: "Allgemein",
    },
    {
        label: "Datum (vollständig)",
        value: "{{meeting.date}}",
        description: "Datum im Format: YYYY-MM-DD",
        category: "Datum & Zeit",
    },
    {
        label: "Jahr",
        value: "{{meeting.date.year}}",
        description: "Jahr der Versammlung (z.B. 2025)",
        category: "Datum & Zeit",
    },
    {
        label: "Monat (Nummer)",
        value: "{{meeting.date.month}}",
        description: "Monat als Nummer (z.B. 12)",
        category: "Datum & Zeit",
    },
    {
        label: "Monat (Name)",
        value: "{{meeting.date.monthName}}",
        description: "Monatsname (z.B. Dezember)",
        category: "Datum & Zeit",
    },
    {
        label: "Tag",
        value: "{{meeting.date.day}}",
        description: "Tag des Monats (z.B. 30)",
        category: "Datum & Zeit",
    },
    {
        label: "Wochentag",
        value: "{{meeting.date.weekday}}",
        description: "Wochentag (z.B. Montag)",
        category: "Datum & Zeit",
    },
    {
        label: "Startzeit",
        value: "{{meeting.startTime}}",
        description: "Startzeit der Versammlung (HH:MM)",
        category: "Datum & Zeit",
    },
    {
        label: "Endzeit",
        value: "{{meeting.endTime}}",
        description: "Endzeit der Versammlung (HH:MM)",
        category: "Datum & Zeit",
    },
    {
        label: "Ortsname",
        value: "{{meeting.locationName}}",
        description: "Name des Versammlungsortes",
        category: "Ort",
    },
    {
        label: "Adresse",
        value: "{{meeting.locationAddress}}",
        description: "Vollständige Adresse des Ortes",
        category: "Ort",
    },
    {
        label: "Einladungsfrist",
        value: "{{meeting.invitationDeadline}}",
        description: "Frist für Einladungen",
        category: "Allgemein",
    },
    {
        label: "Status",
        value: "{{meeting.status}}",
        description: "Status der Versammlung (geplant/laufend/abgeschlossen)",
        category: "Allgemein",
    },
];

/**
 * Replace placeholders in text with actual meeting data
 */
export function replacePlaceholders(text: string, meeting: Meeting): string {
    if (!text || !meeting) return text;

    let result = text;
    const date = new Date(meeting.date);

    // Simple replacements
    const replacements: Record<string, string> = {
        "{{meeting.title}}": meeting.title,
        "{{meeting.date}}": meeting.date,
        "{{meeting.startTime}}": meeting.startTime,
        "{{meeting.endTime}}": meeting.endTime || "",
        "{{meeting.locationName}}": meeting.locationName,
        "{{meeting.locationAddress}}": meeting.locationAddress || "",
        "{{meeting.invitationDeadline}}": meeting.invitationDeadline,
        "{{meeting.status}}":
            meeting.status === "planned"
                ? "geplant"
                : meeting.status === "in-progress"
                  ? "laufend"
                  : "abgeschlossen",
    };

    // Date-specific replacements
    const monthNames = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
    ];
    const weekdayNames = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
    ];

    replacements["{{meeting.date.year}}"] = date.getFullYear().toString();
    replacements["{{meeting.date.month}}"] = (date.getMonth() + 1)
        .toString()
        .padStart(2, "0");
    replacements["{{meeting.date.monthName}}"] = monthNames[date.getMonth()];
    replacements["{{meeting.date.day}}"] = date
        .getDate()
        .toString()
        .padStart(2, "0");
    replacements["{{meeting.date.weekday}}"] = weekdayNames[date.getDay()];

    // Apply all replacements
    for (const [placeholder, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(placeholder, "g"), value);
    }

    return result;
}

/**
 * Get categories for grouping placeholders
 */
export function getPlaceholderCategories(): string[] {
    const categories = new Set(
        MEETING_PLACEHOLDERS.map((p) => p.category),
    );
    return Array.from(categories);
}

/**
 * Get placeholders by category
 */
export function getPlaceholdersByCategory(
    category: string,
): PlaceholderOption[] {
    return MEETING_PLACEHOLDERS.filter((p) => p.category === category);
}
