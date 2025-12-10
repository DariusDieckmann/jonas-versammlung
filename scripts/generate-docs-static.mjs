import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDirectory = path.join(process.cwd(), "documentation/guides");
const outputFile = path.join(process.cwd(), "src/lib/docs-content.ts");

function getAllDocs() {
    const categories = fs.readdirSync(docsDirectory);
    const docsData = {};
    const categoryInfo = {};

    categories
        .filter((category) => {
            const categoryPath = path.join(docsDirectory, category);
            return fs.statSync(categoryPath).isDirectory();
        })
        .forEach((category) => {
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
                        title: data.title,
                        description: data.description,
                        order: data.order,
                        lastUpdated: data.lastUpdated,
                        content: content,
                    };
                })
                .sort((a, b) => a.order - b.order);

            docsData[category] = docs;

            // Get category info from first doc
            if (docs.length > 0) {
                const firstDocPath = path.join(
                    categoryPath,
                    files.find((f) => f.endsWith(".md")),
                );
                const { data } = matter(fs.readFileSync(firstDocPath, "utf8"));

                const categoryTitles = {
                    "eigene-organisation": "Eigene Organisation",
                    liegenschaften: "Liegenschaften",
                    versammlungen: "Versammlungen",
                };

                const categoryDescriptions = {
                    "eigene-organisation":
                        "Verwalten Sie Ihre Organisation, Mitglieder und Einstellungen",
                    liegenschaften:
                        "Legen Sie Liegenschaften, Einheiten und Eigentümer an",
                    versammlungen:
                        "Erstellen und führen Sie Versammlungen durch",
                };

                categoryInfo[category] = {
                    title: categoryTitles[category] || category,
                    description: categoryDescriptions[category] || "",
                    icon: data.icon || "FileText",
                };
            }
        });

    return { docsData, categoryInfo };
}

// Generate the data
const { docsData, categoryInfo } = getAllDocs();

// Generate TypeScript file
const tsContent = `// Auto-generated file - DO NOT EDIT
// Run: pnpm run docs:generate

export const DOCS_CONTENT = ${JSON.stringify(docsData, null, 2)} as const;

export const CATEGORY_INFO = ${JSON.stringify(categoryInfo, null, 2)} as const;
`;

// Write to file
fs.writeFileSync(outputFile, tsContent);

console.log(`✅ Documentation content generated: ${outputFile}`);
console.log(`📚 Categories: ${Object.keys(docsData).length}`);
console.log(
    `📄 Total docs: ${Object.values(docsData).reduce((acc, docs) => acc + docs.length, 0)}`,
);
