const propertiesRoutes = {
    list: "/dashboard/properties",
    new: "/dashboard/properties/new",
    detail: (id: number) => `/dashboard/properties/${id}`,
    edit: (id: number) => `/dashboard/properties/${id}/edit`,
} as const;

export default propertiesRoutes;
