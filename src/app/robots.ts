import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: [
                "/",
                "/dokumentation",
                "/dokumentation/*",
                "/faq",
                "/hilfe-center",
                "/agb",
                "/datenschutz",
                "/impressum",
                "/kostenlos-testen",
            ],
            disallow: [
                "/dashboard/*",
                "/settings/*",
                "/api/*",
                "/meetings/*",
                "/properties/*",
                "/invite/*",
                "/(protected)/*",
                "/(auth)/*",
            ],
        },
        sitemap: "https://triple-d.ninja/sitemap.xml",
    };
}
