import { HybridPageLayout } from "@/components/layouts/hybrid-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { LifeBuoy, Mail, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function HilfeCenterPage() {
    return (
        <HybridPageLayout>
            <div className="bg-gradient-to-b from-blue-50 to-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <LifeBuoy className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Hilfe-Center
                        </h1>
                        <p className="text-xl text-gray-600">
                            Wir sind für Sie da – finden Sie schnell die richtige
                            Unterstützung
                        </p>
                    </div>

                    {/* Support Options */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-12">
                        {/* E-Mail Support */}
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        E-Mail Support
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Schreiben Sie uns eine E-Mail mit Ihrer Anfrage.
                                    Wir antworten in der Regel innerhalb von 24 Stunden.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Clock className="h-4 w-4" />
                                    <span>Antwortzeit: ca. 24 Stunden</span>
                                </div>
                                <a
                                    href="mailto:support@triple-d.ninja"
                                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    support@triple-d.ninja
                                </a>
                            </CardContent>
                        </Card>

                        
                    </div>

                    {/* Quick Links */}
                    <Card className="mb-12">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Häufige Hilfe-Themen
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a
                                    href="/faq"
                                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                            Häufig gestellte Fragen
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Antworten auf die häufigsten Fragen
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="/dokumentation"
                                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                            Dokumentation
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Ausführliche Anleitungen und Tutorials
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="/dokumentation/eigene-organisation/erste-schritte"
                                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                            Erste Schritte
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Schnellstart-Anleitung für neue Nutzer
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Weitere Kontaktmöglichkeiten
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Sie können uns auch über folgende Kanäle erreichen:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <span className="font-medium">Allgemeine Anfragen:</span>
                                        <a
                                            href="mailto:info@triple-d.ninja"
                                            className="ml-2 text-blue-600 hover:underline"
                                        >
                                            info@triple-d.ninja
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <span className="font-medium">
                                            Technischer Support:
                                        </span>
                                        <a
                                            href="mailto:support@triple-d.ninja"
                                            className="ml-2 text-blue-600 hover:underline"
                                        >
                                            support@triple-d.ninja
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </HybridPageLayout>
    );
}
