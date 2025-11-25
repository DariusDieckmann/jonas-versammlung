const propertiesRoutes = {
    list: "/properties",
    new: "/properties/new",
    detail: (id: number) => `/properties/${id}`,
    edit: (id: number) => `/properties/${id}/edit`,
} as const;

export default propertiesRoutes;
