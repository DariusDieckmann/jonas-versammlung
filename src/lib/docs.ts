import matter from "gray-matter";
import { CATEGORY_INFO, DOCS_CONTENT } from "./docs-content";

export interface DocFrontmatter {
    title: string;
    category: string;
    order: number;
    description: string;
    lastUpdated: string;
    icon?: string;
}

export interface Doc {
    slug: string;
    category: string;
    frontmatter: DocFrontmatter;
    content: string;
}

/**
 * Get a specific documentation by category and slug
 * Uses pre-generated static content (no filesystem access)
 */
export function getDocBySlug(category: string, slug: string): Doc | undefined {
    try {
        const categoryDocs =
            DOCS_CONTENT[category as keyof typeof DOCS_CONTENT];

        if (!categoryDocs) {
            console.error(`Category not found: ${category}`);
            return undefined;
        }

        const doc = categoryDocs.find((d) => d.slug === slug);

        if (!doc) {
            console.error(`Doc not found: ${category}/${slug}`);
            return undefined;
        }

        return {
            slug: doc.slug,
            category,
            frontmatter: {
                title: doc.title,
                category,
                order: doc.order,
                description: doc.description,
                lastUpdated: doc.lastUpdated,
                icon: CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]
                    ?.icon,
            },
            content: doc.content,
        };
    } catch (error) {
        console.error(`Error loading doc ${category}/${slug}:`, error);
        return undefined;
    }
}

/**
 * Get navigation information for a specific doc
 */
export function getDocNavigation(category: string, slug: string) {
    const categoryDocs = DOCS_CONTENT[category as keyof typeof DOCS_CONTENT];

    if (!categoryDocs) {
        return { prev: null, next: null };
    }

    const sortedDocs = [...categoryDocs].sort((a, b) => a.order - b.order);
    const currentIndex = sortedDocs.findIndex((doc) => doc.slug === slug);

    if (currentIndex === -1) {
        return { prev: null, next: null };
    }

    const prev =
        currentIndex > 0
            ? {
                  slug: sortedDocs[currentIndex - 1].slug,
                  category,
                  frontmatter: {
                      title: sortedDocs[currentIndex - 1].title,
                      description: sortedDocs[currentIndex - 1].description,
                  },
              }
            : null;

    const next =
        currentIndex < sortedDocs.length - 1
            ? {
                  slug: sortedDocs[currentIndex + 1].slug,
                  category,
                  frontmatter: {
                      title: sortedDocs[currentIndex + 1].title,
                      description: sortedDocs[currentIndex + 1].description,
                  },
              }
            : null;

    return { prev, next };
}
