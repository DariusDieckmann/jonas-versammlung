const publicRoutes = {
    home: "/",
    faq: "/faq",
    dokumentation: {
        index: "/dokumentation",
        category: (category: string, slug: string) => `/dokumentation/${category}/${slug}`,
    },
    hilfeCenter: "/hilfe-center",
    kostenlosTesten: "/kostenlos-testen",
} as const;

export default publicRoutes;
