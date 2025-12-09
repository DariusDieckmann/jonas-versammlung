"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Heart, Target, Award } from "lucide-react";

const benefits = [
    {
        icon: TrendingUp,
        title: "Effizienzsteigerung",
        description:
            "Sparen Sie bis zu 70% der Zeit für administrative Aufgaben. Mehr Zeit für das Wesentliche.",
        stat: "70%",
        statLabel: "Zeitersparnis",
    },
    {
        icon: Heart,
        title: "Transparenz & Nachvollziehbarkeit",
        description:
            "Alle Dokumente, Beschlüsse und Protokolle sind jederzeit für berechtigte Personen einsehbar.",
        stat: "100%",
        statLabel: "Transparenz",
    },
    {
        icon: Target,
        title: "Rechtssicherheit",
        description:
            "Alle Protokolle und Beschlüsse werden rechtssicher dokumentiert und archiviert.",
        stat: "100%",
        statLabel: "Konformität",
    },
    {
        icon: Award,
        title: "Ortsunabhängig arbeiten",
        description:
            "Zugriff von überall – ob im Büro, unterwegs oder von zu Hause aus.",
        stat: "24/7",
        statLabel: "Verfügbar",
    },
];

function BenefitCard({
    benefit,
    index,
}: {
    benefit: (typeof benefits)[0];
    index: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
                isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
            }
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="relative"
        >
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <benefit.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    <div className="mb-4">
                        <div className="text-4xl font-bold text-blue-600 mb-1">
                            {benefit.stat}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                            {benefit.statLabel}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export function BenefitsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                        Ihre Vorteile mit unserer Plattform
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Erleben Sie die Digitalisierung Ihrer Hausverwaltung mit
                        messbaren Erfolgen.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <BenefitCard
                            key={benefit.title}
                            benefit={benefit}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
