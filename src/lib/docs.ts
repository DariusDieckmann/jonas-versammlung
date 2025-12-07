import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

export interface DocCategory {
    name: string;
    slug: string;
    docs: Doc[];
}

/**
 * Get all documentation categories with their docs
 */
export function getAllDocs(): DocCategory[] {
    const categories = fs.readdirSync(docsDirectory);

    return categories
        .filter((category) => {
            const categoryPath = path.join(docsDirectory, category);
            return fs.statSync(categoryPath).isDirectory();
        })
        .map((category) => {
            const categoryPath = path.join(docsDirectory, category);
            const files = fs.readdirSync(categoryPath);

            const docs = files
                .filter((file) => file.endsWith(".md"))
                .map((file) => {
                    const slug = file.replace(/\.md$/, "");
                    const fullPath = path.join(categoryPath, file);
                    const fileContents = fs.readFileSync(fullPath, "utf8");
                    const { data, content } = matter(fileContents);

                    return {
                        slug,
                        category,
                        frontmatter: data as DocFrontmatter,
                        content,
                    };
                })
                .sort((a, b) => a.frontmatter.order - b.frontmatter.order);

            return {
                name: category,
                slug: category,
                docs,
            };
        });
}

/**
 * Get a specific documentation by category and slug
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
        return undefined;
    }
}

/**
 * Get all docs from a specific category
 */
export function getDocsByCategory(category: string): Doc[] {
    try {
        const categoryPath = path.join(docsDirectory, category);
        const files = fs.readdirSync(categoryPath);

        return files
            .filter((file) => file.endsWith(".md"))
            .map((file) => {
                const slug = file.replace(/\.md$/, "");
                const fullPath = path.join(categoryPath, file);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const { data, content } = matter(fileContents);

                return {
                    slug,
                    category,
                    frontmatter: data as DocFrontmatter,
                    content,
                };
            })
            .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
    } catch (error) {
        return [];
    }
}

/**
 * Get all available category slugs
 */
export function getAllCategorySlugs(): string[] {
    const categories = fs.readdirSync(docsDirectory);
    return categories.filter((category) => {
        const categoryPath = path.join(docsDirectory, category);
        return fs.statSync(categoryPath).isDirectory();
    });
}

/**
 * Get all doc slugs for static generation
 */
export function getAllDocSlugs(): Array<{ category: string; slug: string }> {
    const categories = getAllCategorySlugs();
    const slugs: Array<{ category: string; slug: string }> = [];

    for (const category of categories) {
        const docs = getDocsByCategory(category);
        for (const doc of docs) {
            slugs.push({
                category,
                slug: doc.slug,
            });
        }
    }

    return slugs;
}

/**
 * Get navigation data for a doc (prev/next)
 */
export function getDocNavigation(category: string, slug: string) {
    const docs = getDocsByCategory(category);
    const currentIndex = docs.findIndex((doc) => doc.slug === slug);

    return {
        prev: currentIndex > 0 ? docs[currentIndex - 1] : null,
        next: currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null,
    };
}

/**
 * Search docs by query
 */
export function searchDocs(query: string): Doc[] {
    const allCategories = getAllDocs();
    const allDocs = allCategories.flatMap((cat) => cat.docs);

    const lowerQuery = query.toLowerCase();

    return allDocs.filter((doc) => {
        const titleMatch = doc.frontmatter.title.toLowerCase().includes(lowerQuery);
        const descriptionMatch = doc.frontmatter.description
            .toLowerCase()
            .includes(lowerQuery);
        const contentMatch = doc.content.toLowerCase().includes(lowerQuery);

        return titleMatch || descriptionMatch || contentMatch;
    });
}
