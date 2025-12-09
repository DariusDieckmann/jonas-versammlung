import type { MetadataRoute } from "next";
import { DOCS_CONTENT } from "@/lib/docs-content";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://triple-d.ninja";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dokumentation`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/hilfe-center`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/kostenlos-testen`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/impressum`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/datenschutz`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/agb`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    // Documentation pages
    const docPages: MetadataRoute.Sitemap = [];

    for (const [category, docs] of Object.entries(DOCS_CONTENT)) {
        for (const doc of docs) {
            docPages.push({
                url: `${baseUrl}/dokumentation/${category}/${doc.slug}`,
                lastModified: new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.7,
            });
        }
    }

    return [...staticPages, ...docPages];
}
