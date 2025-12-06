import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AGBPage() {
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
                        <FileText className="h-10 w-10 text-blue-600" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            Allgemeine Geschäftsbedingungen (AGB)
                        </h1>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 1 Geltungsbereich
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend
                                „AGB") gelten für alle Verträge über die Nutzung der
                                Software-as-a-Service-Lösung „Eigentümerversammlungen"
                                (nachfolgend „Software" oder „Plattform") zwischen
                                [Firmenname] (nachfolgend „Anbieter") und dem Kunden.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Abweichende, entgegenstehende oder ergänzende
                                Allgemeine Geschäftsbedingungen des Kunden werden nicht
                                Vertragsbestandteil, es sei denn, der Anbieter hat ihrer
                                Geltung ausdrücklich schriftlich zugestimmt.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 2 Vertragsgegenstand
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Anbieter stellt dem Kunden eine cloudbasierte
                                Software zur Verwaltung von Eigentümerversammlungen zur
                                Verfügung. Die Software ermöglicht unter anderem:
                            </p>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Planung und Organisation von
                                        Eigentümerversammlungen
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Erstellung und Verwaltung von digitalen Protokollen
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>Verwaltung von Eigentümerdaten</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>Durchführung digitaler Abstimmungen</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>Benachrichtigungsfunktionen</span>
                                </li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                (2) Der konkrete Leistungsumfang ergibt sich aus der
                                gewählten Tarifoption und der Leistungsbeschreibung auf der
                                Website des Anbieters.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 3 Vertragsschluss
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Die Registrierung auf der Plattform stellt ein Angebot
                                des Kunden zum Abschluss eines Nutzungsvertrages dar.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Der Vertrag kommt durch die Bestätigung der
                                Registrierung durch den Anbieter per E-Mail zustande.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                (3) Der Kunde gewährleistet, dass die von ihm bei der
                                Registrierung angegebenen Daten vollständig und richtig
                                sind.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 4 Nutzungsrechte
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Anbieter räumt dem Kunden für die Dauer des
                                Vertrages ein nicht ausschließliches, nicht übertragbares
                                und nicht unterlizenzierbares Recht zur Nutzung der
                                Software ein.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Der Kunde ist nicht berechtigt, die Software zu
                                vervielfältigen, zu bearbeiten oder in sonstiger Weise zu
                                verändern, es sei denn, dies ist für die vertragsgemäße
                                Nutzung erforderlich.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 5 Vergütung und Zahlungsbedingungen
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Die Vergütung richtet sich nach der vom Kunden
                                gewählten Tarifoption gemäß der aktuellen Preisliste auf
                                der Website des Anbieters.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Sofern nicht anders vereinbart, erfolgt die Abrechnung
                                monatlich im Voraus.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                (3) Alle Preise verstehen sich zuzüglich der jeweils
                                gültigen gesetzlichen Umsatzsteuer.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 6 Verfügbarkeit und Wartung
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Anbieter bemüht sich um eine möglichst hohe
                                Verfügbarkeit der Software. Eine Verfügbarkeit von 99%
                                im Jahresmittel wird angestrebt.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Der Anbieter ist berechtigt, die Software für
                                Wartungsarbeiten vorübergehend außer Betrieb zu nehmen.
                                Geplante Wartungsarbeiten werden dem Kunden rechtzeitig
                                angekündigt.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 7 Datenschutz und Datensicherheit
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Anbieter erhebt, verarbeitet und nutzt
                                personenbezogene Daten des Kunden ausschließlich im Rahmen
                                der gesetzlichen Bestimmungen.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Nähere Informationen zum Datenschutz finden sich in der
                                Datenschutzerklärung des Anbieters.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                (3) Der Anbieter trifft technische und organisatorische
                                Maßnahmen gemäß Art. 32 DSGVO, um die Daten des Kunden vor
                                unbefugtem Zugriff zu schützen.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 8 Pflichten des Kunden
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Kunde ist verpflichtet, seine Zugangsdaten geheim
                                zu halten und vor dem Zugriff durch Dritte zu schützen.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Der Kunde verpflichtet sich, die Software nicht
                                missbräuchlich zu nutzen und keine rechtswidrigen Inhalte
                                zu speichern oder zu verbreiten.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 9 Haftung
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Anbieter haftet unbeschränkt für Schäden aus der
                                Verletzung des Lebens, des Körpers oder der Gesundheit, die
                                auf einer vorsätzlichen oder fahrlässigen
                                Pflichtverletzung des Anbieters beruhen.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Für sonstige Schäden haftet der Anbieter nur bei
                                Vorsatz und grober Fahrlässigkeit.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 10 Vertragslaufzeit und Kündigung
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Der Vertrag wird für die in der gewählten Tarifoption
                                angegebene Mindestlaufzeit geschlossen.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Nach Ablauf der Mindestlaufzeit verlängert sich der
                                Vertrag automatisch um einen weiteren Monat, sofern er
                                nicht mit einer Frist von 14 Tagen zum Ende der
                                Mindestlaufzeit bzw. zum Ende eines Verlängerungszeitraums
                                gekündigt wird.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                (3) Das Recht zur außerordentlichen Kündigung aus wichtigem
                                Grund bleibt unberührt.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                § 11 Schlussbestimmungen
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (1) Es gilt das Recht der Bundesrepublik Deutschland unter
                                Ausschluss des UN-Kaufrechts.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                (2) Sollten einzelne Bestimmungen dieser AGB unwirksam oder
                                undurchführbar sein oder werden, berührt dies die
                                Wirksamkeit der übrigen Bestimmungen nicht.
                            </p>
                        </section>

                        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Stand:</strong> Dezember 2025
                            </p>
                            <p className="text-sm text-gray-600">
                                Bei Fragen zu den AGB kontaktieren Sie uns unter:{" "}
                                <a
                                    href="mailto:info@versammlung.de"
                                    className="text-blue-600 hover:underline"
                                >
                                    info@versammlung.de
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
