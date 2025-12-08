import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DocNavigationProps {
    prev?: {
        slug: string;
        category: string;
        frontmatter: {
            title: string;
            description: string;
        };
    } | null;
    next?: {
        slug: string;
        category: string;
        frontmatter: {
            title: string;
            description: string;
        };
    } | null;
}

export function DocNavigation({ prev, next }: DocNavigationProps) {
    if (!prev && !next) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-200">
            {prev ? (
                <Link href={`/dokumentation/${prev.category}/${prev.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <ChevronLeft className="h-5 w-5 text-gray-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">
                                        Vorheriger Artikel
                                    </div>
                                    <div className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {prev.frontmatter.title}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {prev.frontmatter.description}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ) : (
                <div />
            )}

            {next && (
                <Link href={`/dokumentation/${next.category}/${next.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 mb-1 text-right">
                                        Nächster Artikel
                                    </div>
                                    <div className="font-semibold text-gray-900 mb-1 text-right group-hover:text-blue-600 transition-colors">
                                        {next.frontmatter.title}
                                    </div>
                                    <div className="text-sm text-gray-600 text-right">
                                        {next.frontmatter.description}
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            )}
        </div>
    );
}
