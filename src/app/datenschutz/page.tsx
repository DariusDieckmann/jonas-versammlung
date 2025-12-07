import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DatenschutzPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/">
                        <Button variant="ghost" className="group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Zurück zur Startseite
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="h-10 w-10 text-blue-600" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            Datenschutzerklärung
                        </h1>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                1. Datenschutz auf einen Blick
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Allgemeine Hinweise
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Die folgenden Hinweise geben einen einfachen Überblick
                                darüber, was mit Ihren personenbezogenen Daten passiert,
                                wenn Sie diese Website besuchen. Personenbezogene Daten
                                sind alle Daten, mit denen Sie persönlich identifiziert
                                werden können.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Database className="h-6 w-6 text-blue-600" />
                                2. Datenerfassung auf dieser Website
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Wer ist verantwortlich für die Datenerfassung auf dieser
                                Website?
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Die Datenverarbeitung auf dieser Website erfolgt durch den
                                Websitebetreiber. Dessen Kontaktdaten können Sie dem
                                Abschnitt „Hinweis zur verantwortlichen Stelle" in dieser
                                Datenschutzerklärung entnehmen.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Wie erfassen wir Ihre Daten?
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns
                                diese mitteilen. Hierbei kann es sich z.B. um Daten
                                handeln, die Sie in ein Kontaktformular eingeben.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Andere Daten werden automatisch oder nach Ihrer
                                Einwilligung beim Besuch der Website durch unsere
                                IT-Systeme erfasst. Das sind vor allem technische Daten
                                (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des
                                Seitenaufrufs).
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Wofür nutzen wir Ihre Daten?
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Ein Teil der Daten wird erhoben, um eine fehlerfreie
                                Bereitstellung der Website zu gewährleisten. Andere Daten
                                können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Welche Rechte haben Sie bezüglich Ihrer Daten?
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Sie haben jederzeit das Recht, unentgeltlich Auskunft über
                                Herkunft, Empfänger und Zweck Ihrer gespeicherten
                                personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                                Recht, die Berichtigung oder Löschung dieser Daten zu
                                verlangen. Wenn Sie eine Einwilligung zur
                                Datenverarbeitung erteilt haben, können Sie diese
                                Einwilligung jederzeit für die Zukunft widerrufen.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock className="h-6 w-6 text-blue-600" />
                                3. Hosting und Content Delivery Networks (CDN)
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Cloudflare
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Wir nutzen Cloudflare als CDN und Hosting-Provider. Dies
                                dient der Sicherheit und der Optimierung der
                                Geschwindigkeit unserer Website gemäß Art. 6 Abs. 1 lit. f
                                DSGVO.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Anbieter ist Cloudflare Inc., 101 Townsend St., San
                                Francisco, CA 94107, USA. Weitere Informationen finden Sie
                                in der Datenschutzerklärung von Cloudflare:{" "}
                                <a
                                    href="https://www.cloudflare.com/privacypolicy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    https://www.cloudflare.com/privacypolicy/
                                </a>
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Eye className="h-6 w-6 text-blue-600" />
                                4. Allgemeine Hinweise und Pflichtinformationen
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Datenschutz
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Die Betreiber dieser Seiten nehmen den Schutz Ihrer
                                persönlichen Daten sehr ernst. Wir behandeln Ihre
                                personenbezogenen Daten vertraulich und entsprechend den
                                gesetzlichen Datenschutzvorschriften sowie dieser
                                Datenschutzerklärung.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Hinweis zur verantwortlichen Stelle
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Die verantwortliche Stelle für die Datenverarbeitung auf
                                dieser Website ist:
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <p className="text-gray-700">
                                    [Firmenname]
                                    <br />
                                    [Straße und Hausnummer]
                                    <br />
                                    [PLZ und Ort]
                                </p>
                                <p className="text-gray-700 mt-3 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <a
                                        href="mailto:datenschutz@triple-d.ninja"
                                        className="text-blue-600 hover:underline"
                                    >
                                        datenschutz@triple-d.ninja
                                    </a>
                                </p>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Verantwortliche Stelle ist die natürliche oder juristische
                                Person, die allein oder gemeinsam mit anderen über die
                                Zwecke und Mittel der Verarbeitung von personenbezogenen
                                Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                5. Ihre Rechte
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        Auskunftsrecht
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Sie haben das Recht, eine Bestätigung darüber zu
                                        verlangen, ob betreffende Daten verarbeitet werden
                                        und auf Auskunft über diese Daten sowie auf weitere
                                        Informationen und Kopie der Daten entsprechend Art.
                                        15 DSGVO.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        Recht auf Berichtigung
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Sie haben ein Recht auf Berichtigung unrichtiger
                                        oder auf Vervollständigung richtiger Daten gemäß
                                        Art. 16 DSGVO.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        Recht auf Löschung
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Sie haben ein Recht auf Löschung Ihrer bei uns
                                        gespeicherten Daten gemäß Art. 17 DSGVO.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        Recht auf Datenübertragbarkeit
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Sie haben das Recht, Daten, die wir auf Grundlage
                                        Ihrer Einwilligung oder in Erfüllung eines Vertrags
                                        automatisiert verarbeiten, an sich oder an einen
                                        Dritten in einem gängigen, maschinenlesbaren Format
                                        aushändigen zu lassen gemäß Art. 20 DSGVO.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Kontakt bei Datenschutzfragen
                            </h3>
                            <p className="text-gray-700 mb-3">
                                Bei Fragen zum Datenschutz können Sie sich jederzeit an
                                uns wenden:
                            </p>
                            <a
                                href="mailto:datenschutz@triple-d.ninja"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                datenschutz@triple-d.ninja
                            </a>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
