import matter from "gray-matter";
import { DOCS_DATA } from "./docs-static";
import fs from "fs";
import path from "path";

const docsDirectory = path.join(process.cwd(), "documentation/guides");

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
 * This function reads from the filesystem at build time
 * When deployed to Cloudflare Workers, pages using this must be statically generated
 */
export function getDocBySlug(
    category: string,
    slug: string,
): Doc | undefined {
    try {
        const fullPath = path.join(docsDirectory, category, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
            slug,
            category,
            frontmatter: data as DocFrontmatter,
            content,
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
    const categoryDocs = DOCS_DATA[category as keyof typeof DOCS_DATA];
    
    if (!categoryDocs) {
        return { prev: null, next: null };
    }

    const sortedDocs = [...categoryDocs].sort((a, b) => a.order - b.order);
    const currentIndex = sortedDocs.findIndex((doc) => doc.slug === slug);

    if (currentIndex === -1) {
        return { prev: null, next: null };
    }

    const prev = currentIndex > 0 ? {
        slug: sortedDocs[currentIndex - 1].slug,
        category,
        frontmatter: {
            title: sortedDocs[currentIndex - 1].title,
            description: sortedDocs[currentIndex - 1].description,
        },
    } : null;

    const next = currentIndex < sortedDocs.length - 1 ? {
        slug: sortedDocs[currentIndex + 1].slug,
        category,
        frontmatter: {
            title: sortedDocs[currentIndex + 1].title,
            description: sortedDocs[currentIndex + 1].description,
        },
    } : null;

    return { prev, next };
}
