/**
 * Generate R2 storage paths for meetings and agenda items
 * This ensures consistent hierarchical folder structure
 */

/**
 * Get the R2 path for a meeting's files
 * @param meetingId - The meeting ID
 * @returns Path like "meetings/123"
 */
export function getMeetingPath(meetingId: number): string {
    return `meetings/${meetingId}`;
}

/**
 * Get the R2 path for an agenda item's files
 * @param meetingId - The meeting ID that owns this agenda item
 * @param agendaItemId - The agenda item ID
 * @returns Path like "meetings/123/agenda-items/456"
 */
export function getAgendaItemPath(
    meetingId: number,
    agendaItemId: number,
): string {
    return `${getMeetingPath(meetingId)}/agenda-items/${agendaItemId}`;
}
