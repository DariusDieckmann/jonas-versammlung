const conductRoutes = {
    start: (meetingId: number) => `/meetings/${meetingId}/conduct`,
    leaders: (meetingId: number) => `/meetings/${meetingId}/conduct/leaders`,
    participants: (meetingId: number) => `/meetings/${meetingId}/conduct/participants`,
    agendaItems: (meetingId: number) => `/meetings/${meetingId}/conduct/agenda-items`,
} as const;

export default conductRoutes;
