const meetingsRoutes = {
    list: "/meetings",
    new: "/meetings/new",
    detail: (id: number) => `/meetings/${id}`,
    edit: (id: number) => `/meetings/${id}/edit`,
    exportPdf: (id: number) => `/api/meetings/${id}/export-pdf`,
} as const;

export default meetingsRoutes;
