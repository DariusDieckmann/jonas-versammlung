import { HybridPageLayout } from "@/components/layouts/hybrid-page-layout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
    HelpCircle,
    Users,
    Calendar,
    FileText,
    Shield,
    Settings,
} from "lucide-react";

const faqCategories = [
    {
        icon: Users,
        title: "Allgemeine Fragen",
        questions: [
            {
                question: "Was ist Eigentümerversammlungen?",
                answer: "Eigentümerversammlungen ist eine cloudbasierte Software-Lösung zur digitalen Verwaltung von Eigentümerversammlungen, Protokollen und Abstimmungen. Die Plattform richtet sich an WEG-Verwalter, Hausverwaltungen und Eigentümergemeinschaften.",
            },
            {
                question: "Für wen ist die Software geeignet?",
                answer: "Die Software ist ideal für WEG-Verwalter, Hausverwaltungen, Eigentümergemeinschaften und alle, die Eigentümerversammlungen professionell und digital organisieren möchten.",
            },
            {
                question: "Benötige ich technische Vorkenntnisse?",
                answer: "Nein, die Software ist intuitiv bedienbar und erfordert keine besonderen technischen Kenntnisse. Nach einer kurzen Einarbeitungszeit können Sie direkt loslegen.",
            },
            {
                question: "Gibt es eine Testversion?",
                answer: "Ja, Sie können die Software kostenlos testen. Registrieren Sie sich einfach und testen Sie alle Funktionen unverbindlich.",
            },
        ],
    },
    {
        icon: Calendar,
        title: "Versammlungen & Meetings",
        questions: [
            {
                question: "Wie erstelle ich eine neue Versammlung?",
                answer: "Gehen Sie im Dashboard auf 'Versammlungen' und klicken Sie auf 'Neue Versammlung'. Füllen Sie die erforderlichen Informationen aus (Datum, Zeit, Ort, Agenda) und speichern Sie die Versammlung.",
            },
            {
                question: "Kann ich Versammlungen bearbeiten oder absagen?",
                answer: "Ja, Sie können jederzeit bestehende Versammlungen bearbeiten oder absagen. Alle eingeladenen Teilnehmer werden automatisch über Änderungen informiert.",
            },
        ],
    },
    {
        icon: FileText,
        title: "Protokolle & Dokumente",
        questions: [
            {
                question: "Wie erstelle ich ein Protokoll?",
                answer: "Protokolle können während oder nach einer Versammlung erstellt werden. Navigieren Sie zur entsprechenden Versammlung und wählen Sie 'Protokoll erstellen'. Sie können alle Beschlüsse und Diskussionspunkte dokumentieren.",
            },
            {
                question: "Sind die Protokolle rechtssicher?",
                answer: "Ja, alle Protokolle werden mit Zeitstempel und Versionierung gespeichert. Sie erfüllen die rechtlichen Anforderungen für WEG-Versammlungen gemäß WEG.",
            },
            {
                question: "Kann ich Dokumente hochladen?",
                answer: "Ja, Sie können relevante Dokumente zu jeder Versammlung hochladen und für berechtigte Personen zugänglich machen.",
            },
        ],
    },
    {
        icon: Shield,
        title: "Datenschutz & Sicherheit",
        questions: [
            {
                question: "Wie sicher sind meine Daten?",
                answer: "Ihre Daten werden verschlüsselt in deutschen/europäischen Rechenzentren gespeichert. Wir verwenden modernste Sicherheitsstandards und sind vollständig DSGVO-konform.",
            },
            {
                question: "Wer hat Zugriff auf meine Daten?",
                answer: "Nur Sie und von Ihnen autorisierte Personen haben Zugriff auf Ihre Daten.",
            },
            {
                question: "Werden meine Daten an Dritte weitergegeben?",
                answer: "Nein, Ihre Daten werden niemals an Dritte weitergegeben oder verkauft. Wir halten uns strikt an die DSGVO.",
            },
        ],
    },
    {
        icon: Settings,
        title: "Funktionen & Einstellungen",
        questions: [
            {
                question: "Kann ich Benutzerrollen vergeben?",
                answer: "Ja, Sie können verschiedene Rollen vergeben (Admin, Verwalter, Eigentümer) mit unterschiedlichen Berechtigungen.",
            },
            {
                question: "Gibt es eine mobile App?",
                answer: "Die Plattform ist vollständig responsive und funktioniert auf allen Geräten (Desktop, Tablet, Smartphone) über den Browser.",
            },
            {
                question: "Kann ich Daten exportieren?",
                answer: "Ja, Sie können jederzeit alle Ihre Daten exportieren. Protokolle können als PDF heruntergeladen werden.",
            },
        ],
    },
];

export default function FAQPage() {
    return (
        <HybridPageLayout>
            <div className="bg-gradient-to-b from-blue-50 to-white py-22">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <HelpCircle className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Häufig gestellte Fragen (FAQ)
                        </h1>
                        <p className="text-xl text-gray-600">
                            Finden Sie schnell Antworten auf die häufigsten
                            Fragen
                        </p>
                    </div>

                    {/* FAQ Categories */}
                    <div className="space-y-8">
                        {faqCategories.map((category, categoryIndex) => (
                            <Card key={categoryIndex}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <category.icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {category.title}
                                        </h2>
                                    </div>

                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full"
                                    >
                                        {category.questions.map(
                                            (item, index) => (
                                                <AccordionItem
                                                    key={index}
                                                    value={`item-${categoryIndex}-${index}`}
                                                >
                                                    <AccordionTrigger className="text-left">
                                                        {item.question}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-gray-600 leading-relaxed">
                                                        {item.answer}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ),
                                        )}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Ihre Frage wurde nicht beantwortet?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Kontaktieren Sie uns – wir helfen Ihnen gerne
                                weiter!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:support@triple-d.ninja"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Support kontaktieren
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </HybridPageLayout>
    );
}
