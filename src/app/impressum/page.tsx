import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImpressumPage() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        Impressum
                    </h1>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Angaben gemäß § 5 TMG
                            </h2>
                            <div className="space-y-3 text-gray-700">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            [Firmenname eintragen]
                                        </p>
                                        <p>[Rechtsform]</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p>[Straße und Hausnummer]</p>
                                        <p>[PLZ und Ort]</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Kontakt
                            </h2>
                            <div className="space-y-3 text-gray-700">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <a
                                        href="tel:+49XXXXXXXXXX"
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        +49 (0) XXX XXXXXXX
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <a
                                        href="mailto:info@triple-d.ninja"
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        info@triple-d.ninja
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Vertreten durch
                            </h2>
                            <p className="text-gray-700">
                                [Name des Geschäftsführers]
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Registereintrag
                            </h2>
                            <div className="text-gray-700 space-y-1">
                                <p>
                                    <span className="font-medium">
                                        Eintragung im Handelsregister:
                                    </span>
                                </p>
                                <p>Registergericht: [Amtsgericht]</p>
                                <p>Registernummer: [HRB XXXXX]</p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Umsatzsteuer-ID
                            </h2>
                            <p className="text-gray-700">
                                Umsatzsteuer-Identifikationsnummer gemäß § 27 a
                                Umsatzsteuergesetz:
                                <br />
                                <span className="font-medium">
                                    DE [XXX XXX XXX]
                                </span>
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Verantwortlich für den Inhalt nach § 55 Abs. 2
                                RStV
                            </h2>
                            <p className="text-gray-700">
                                [Name]
                                <br />
                                [Adresse]
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                EU-Streitschlichtung
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Die Europäische Kommission stellt eine Plattform
                                zur Online-Streitbeilegung (OS) bereit:{" "}
                                <a
                                    href="https://ec.europa.eu/consumers/odr/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    https://ec.europa.eu/consumers/odr/
                                </a>
                                . Unsere E-Mail-Adresse finden Sie oben im
                                Impressum.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Verbraucherstreitbeilegung /
                                Universalschlichtungsstelle
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Wir sind nicht bereit oder verpflichtet, an
                                Streitbeilegungsverfahren vor einer
                                Verbraucherschlichtungsstelle teilzunehmen.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Haftung für Inhalte
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG
                                für eigene Inhalte auf diesen Seiten nach den
                                allgemeinen Gesetzen verantwortlich. Nach §§ 8
                                bis 10 TMG sind wir als Diensteanbieter jedoch
                                nicht verpflichtet, übermittelte oder
                                gespeicherte fremde Informationen zu überwachen
                                oder nach Umständen zu forschen, die auf eine
                                rechtswidrige Tätigkeit hinweisen.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Verpflichtungen zur Entfernung oder Sperrung der
                                Nutzung von Informationen nach den allgemeinen
                                Gesetzen bleiben hiervon unberührt. Eine
                                diesbezügliche Haftung ist jedoch erst ab dem
                                Zeitpunkt der Kenntnis einer konkreten
                                Rechtsverletzung möglich. Bei Bekanntwerden von
                                entsprechenden Rechtsverletzungen werden wir
                                diese Inhalte umgehend entfernen.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
