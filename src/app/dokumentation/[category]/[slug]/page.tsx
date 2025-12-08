import { notFound } from "next/navigation";
import { HybridPageLayout } from "@/components/layouts/hybrid-page-layout";
import { MarkdownContent } from "@/modules/documentation/markdown-content";
import { TableOfContents } from "@/modules/documentation/table-of-contents";
import { DocNavigation } from "@/modules/documentation/doc-navigation";
import { DOCS_CONTENT } from "@/lib/docs-content";
import { getDocBySlug, getDocNavigation } from "@/lib/docs";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import publicRoutes from "@/lib/public.route";

interface DocPageProps {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const slugs: Array<{ category: string; slug: string }> = [];
    
    for (const [category, docs] of Object.entries(DOCS_CONTENT)) {
        for (const doc of docs) {
            slugs.push({ category, slug: doc.slug });
        }
    }
    
    return slugs;
}

export async function generateMetadata({
    params,
}: DocPageProps): Promise<Metadata> {
    const { category, slug } = await params;
    const doc = getDocBySlug(category, slug);

    if (!doc) {
        return {
            title: "Dokumentation nicht gefunden",
        };
    }

    return {
        title: `${doc.frontmatter.title} | Dokumentation`,
        description: doc.frontmatter.description,
    };
}

export default async function DocPage({ params }: DocPageProps) {
    const { category, slug } = await params;
    const doc = getDocBySlug(category, slug);

    if (!doc) {
        notFound();
    }

    const navigation = getDocNavigation(category, slug);

    return (
        <HybridPageLayout>
            <div className="bg-gradient-to-b from-blue-50 to-white pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link
                            href={publicRoutes.dokumentation.index}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Zurück zur Übersicht
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_250px] gap-12">
                        {/* Main Content */}
                        <article className="min-w-0">
                            {/* Header */}
                            <header className="mb-8">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {doc.frontmatter.title}
                                </h1>
                                <p className="text-xl text-gray-600 mb-4">
                                    {doc.frontmatter.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    Zuletzt aktualisiert:{" "}
                                    {new Date(
                                        doc.frontmatter.lastUpdated,
                                    ).toLocaleDateString("de-DE", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                            </header>

                            {/* Content */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <MarkdownContent content={doc.content} />
                            </div>

                            {/* Navigation */}
                            <DocNavigation prev={navigation.prev} next={navigation.next} />
                        </article>

                        {/* Table of Contents */}
                        <aside>
                            <TableOfContents content={doc.content} />
                        </aside>
                    </div>
                </div>
            </div>
        </HybridPageLayout>
    );
}
