const meetingsRoutes = {
    list: "/meetings",
    new: "/meetings/new",
    detail: (id: number) => `/meetings/${id}`,
    edit: (id: number) => `/meetings/${id}/edit`,
} as const;

export default meetingsRoutes;
