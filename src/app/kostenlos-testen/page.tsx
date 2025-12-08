import { PublicPageLayout } from "@/components/layouts/public-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Rocket,
    CheckCircle,
    Clock,
    Shield,
    Zap,
    Mail,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";

const features = [
    "Versammlungen planen und durchführen",
    "Digitale Protokolle erstellen und verwalten",
    "Eigentümer und Einheiten anlegen",
    "Digitale Abstimmungen durchführen",
    "Benachrichtigungen per E-Mail",
    "Dokumente hochladen und verwalten",
    "Organisationen erstellen und verwalten",
    "Mitglieder einladen und Rollen zuweisen",
    "Agenda für Versammlungen festlegen",
    "Beschlüsse rechtssicher dokumentieren",
    "Cloud-basierter Zugriff von überall",
    "DSGVO-konforme Datenverwaltung",
    "Keine Kreditkarte erforderlich",
];

export default function KostenlosTesterPage() {
    return (
        <PublicPageLayout>
            <div className="bg-gradient-to-b from-blue-50 via-white to-gray-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Rocket className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Kostenlos testen
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Testen Sie alle Funktionen unverbindlich und ohne Risiko
                        </p>
                    </div>

                    {/* How it works */}
                    <Card className="mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Zap className="h-6 w-6 text-blue-600" />
                                So einfach geht's
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Einloggen und loslegen
                                        </h3>
                                        <p className="text-gray-600">
                                            Melden Sie sich einfach mit Ihrem Google- oder
                                            Microsoft-Account an – ohne komplizierte
                                            Registrierung.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Alle Funktionen nutzen
                                        </h3>
                                        <p className="text-gray-600">
                                            Testen Sie die gesamte Plattform uneingeschränkt.
                                            Erstellen Sie Versammlungen, Protokolle und vieles
                                            mehr.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Bei Interesse: Kontakt aufnehmen
                                        </h3>
                                        <p className="text-gray-600">
                                            Überzeugt? Kontaktieren Sie uns für eine feste
                                            Vereinbarung und unbegrenzten Zugang.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features */}
                    <Card className="mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Das ist alles inklusive
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Notice */}
                    <Card className="mb-8 border-amber-200 bg-amber-50">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Wichtiger Hinweis zur Testphase
                                    </h3>
                                    <p className="text-gray-700 mb-4 leading-relaxed">
                                        Wenn Ihre Organisation noch nicht bei uns registriert
                                        ist, werden die von Ihnen erstellten Testdaten{" "}
                                        <strong>automatisch nach 7 Tagen gelöscht</strong>.
                                        Dies dient dem Schutz Ihrer Daten und der Einhaltung
                                        der Datenschutzbestimmungen.
                                    </p>
                                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                                        <p className="text-gray-700 mb-2">
                                            <strong>Sie möchten dauerhaft mit uns arbeiten?</strong>
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Kontaktieren Sie uns einfach während oder nach der
                                            Testphase. Wir richten Ihnen dann einen dauerhaften
                                            Account ein und Ihre Daten bleiben erhalten.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Privacy */}
                    <Card className="mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="h-6 w-6 text-blue-600" />
                                Sicherheit & Datenschutz
                            </h2>
                            <div className="space-y-4 text-gray-700">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <strong>DSGVO-konform:</strong> Alle Daten werden
                                        verschlüsselt und sicher in Europa gespeichert
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <strong>Keine Kreditkarte:</strong> Sie müssen keine
                                        Zahlungsinformationen angeben
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <strong>Automatische Löschung:</strong> Nach 7 Tagen
                                        werden Testdaten automatisch entfernt (außer bei fester
                                        Vereinbarung)
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <strong>Keine versteckten Kosten:</strong> Der Test ist
                                        komplett kostenlos und unverbindlich
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA Buttons */}
                    <div className="text-center">
                        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold mb-3">
                                    Bereit zum Testen?
                                </h3>
                                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                    Loggen Sie sich jetzt ein und überzeugen Sie sich selbst
                                    von unserer Plattform.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/login">
                                        <Button
                                            size="lg"
                                            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
                                        >
                                            Jetzt kostenlos testen
                                        </Button>
                                    </Link>
                                    <a href="mailto:info@triple-d.ninja">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                                        >
                                            <Mail className="h-5 w-5 mr-2" />
                                            Kontakt aufnehmen
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* FAQ Quick Links */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">Haben Sie noch Fragen?</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/faq"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Zu den FAQ
                            </Link>
                            <span className="text-gray-400">•</span>
                            <Link
                                href="/hilfe-center"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Hilfe-Center
                            </Link>
                            <span className="text-gray-400">•</span>
                            <a
                                href="mailto:support@triple-d.ninja"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Support kontaktieren
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicPageLayout>
    );
}
