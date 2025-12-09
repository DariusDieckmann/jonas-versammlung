"use client";

import { motion, useInView } from "framer-motion";
import {
    Bell,
    Calendar,
    CheckSquare,
    Clock,
    Cloud,
    FileText,
    Shield,
    Users,
    Zap,
} from "lucide-react";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        icon: Calendar,
        title: "Versammlungsplanung",
        description:
            "Planen Sie Eigentümerversammlungen mit wenigen Klicks. Organisieren Sie Termine und Agenda effizient.",
    },
    {
        icon: FileText,
        title: "Digitale Protokolle",
        description:
            "Erstellen Sie rechtssichere Protokolle mit automatischer Dokumentation aller Beschlüsse.",
    },
    {
        icon: Users,
        title: "Eigentümerverwaltung",
        description:
            "Verwalten Sie alle Eigentümer und deren Eigenschaften übersichtlich an einem Ort.",
    },
    {
        icon: CheckSquare,
        title: "Abstimmungsmanagement",
        description:
            "Führen Sie digitale Abstimmungen durch mit automatischer Stimmauszählung und Protokollierung.",
    },
    {
        icon: Bell,
        title: "Benachrichtigungen",
        description:
            "Wir benachrichtigen Sie automatisch über Ihre bevorstehenden Versammlungen.",
    },
    {
        icon: Shield,
        title: "DSGVO-konform",
        description:
            "Höchste Sicherheitsstandards und vollständige DSGVO-Konformität für Ihre Daten.",
    },
    {
        icon: Clock,
        title: "Zeitersparnis",
        description:
            "Reduzieren Sie den administrativen Aufwand um bis zu 70% durch Automatisierung.",
    },
    {
        icon: Cloud,
        title: "Cloud-basiert",
        description:
            "Greifen Sie von überall auf Ihre Daten zu – sicher verschlüsselt in der Cloud.",
    },
    {
        icon: Zap,
        title: "Schnelle Integration",
        description:
            "Starten Sie sofort – ohne komplizierte Installation oder Schulung.",
    },
];

function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof features)[0];
    index: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <feature.icon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                        isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                    }
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Alle Funktionen auf einen Blick
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Digitalisieren Sie Ihre Hausverwaltung und
                        Eigentümerversammlungen mit unserer modernen Plattform.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
