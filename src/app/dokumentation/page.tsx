import { HybridPageLayout } from "@/components/layouts/hybrid-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
    Book,
    PlayCircle,
    FileText,
    Users,
    Calendar,
    Settings,
    CheckCircle,
    Building2,
} from "lucide-react";
import { DOCS_DATA, CATEGORY_INFO } from "@/lib/docs-static";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    PlayCircle,
    Calendar,
    FileText,
    Users,
    Settings,
    Building2,
};

export default function DokumentationPage() {
    const categories = Object.entries(DOCS_DATA).map(([slug, docs]) => ({
        slug,
        name: CATEGORY_INFO[slug as keyof typeof CATEGORY_INFO].title,
        description: CATEGORY_INFO[slug as keyof typeof CATEGORY_INFO].description,
        icon: CATEGORY_INFO[slug as keyof typeof CATEGORY_INFO].icon,
        docs: [...docs].sort((a, b) => a.order - b.order),
    }));

    return (
        <HybridPageLayout>
            <div className="bg-gradient-to-b from-blue-50 to-white py-22">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Book className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Dokumentation
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Umfassende Anleitungen und Hilfestellungen für die Nutzung
                            der Plattform
                        </p>
                    </div>

                    {/* Quick Start Banner */}
                    <Card className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <PlayCircle className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        Schnellstart-Anleitung
                                    </h3>
                                    <p className="text-blue-100 mb-4">
                                        Neu auf der Plattform? Folgen Sie unserer
                                        Schritt-für-Schritt-Anleitung und starten Sie
                                        in wenigen Minuten.
                                    </p>
                                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                                        <PlayCircle className="h-5 w-5" />
                                        Schnellstart ansehen
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documentation Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {categories.map((category) => {
                            const Icon = iconMap[category.icon] || FileText;

                            return (
                                <Card
                                    key={category.slug}
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {category.name}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {category.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {category.docs.map((doc) => (
                                                <li key={doc.slug}>
                                                    <Link
                                                        href={`/dokumentation/${category.slug}/${doc.slug}`}
                                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                                        {doc.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>

                    {/* Help CTA */}
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Benötigen Sie weitere Hilfe?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Unser Support-Team steht Ihnen bei Fragen gerne zur
                                Verfügung.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:support@triple-d.ninja"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Support kontaktieren
                                </a>
                                <a
                                    href="/faq"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300"
                                >
                                    FAQ ansehen
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </HybridPageLayout>
    );
}
