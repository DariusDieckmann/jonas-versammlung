const conductRoutes = {
    start: (meetingId: number) => `/meetings/${meetingId}/conduct`,
    leaders: (meetingId: number) => `/meetings/${meetingId}/conduct/leaders`,
    participants: (meetingId: number) => `/meetings/${meetingId}/conduct/participants`,
} as const;

export default conductRoutes;
