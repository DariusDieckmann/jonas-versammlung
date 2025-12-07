import { notFound } from "next/navigation";
import { HybridPageLayout } from "@/components/layouts/hybrid-page-layout";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { TableOfContents } from "@/components/documentation/table-of-contents";
import { DocNavigation } from "@/components/documentation/doc-navigation";
import {
    getDocBySlug,
    getAllDocSlugs,
    getDocNavigation,
} from "@/lib/docs";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface DocPageProps {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const slugs = getAllDocSlugs();
    return slugs.map(({ category, slug }) => ({
        category,
        slug,
    }));
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

    // Format category name for display
    const categoryName = category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return (
        <HybridPageLayout>
            <div className="bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link
                            href="/dokumentation"
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
