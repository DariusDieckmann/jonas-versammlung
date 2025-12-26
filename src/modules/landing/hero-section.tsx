"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import authRoutes from "@/modules/auth/shared/auth.route";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-20 pb-32">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                    style={{
                        willChange: "transform",
                        transform: "translateZ(0)",
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                    style={{
                        willChange: "transform",
                        transform: "translateZ(0)",
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
                            Eigentümerversammlungen{" "}
                            <span className="text-blue-600">digital</span>{" "}
                            gestalten
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
                    >
                        Moderne Hausverwaltung für WEG-Verwalter und Eigentümer.
                        Effizient, transparent und rechtssicher.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                    >
                        <Link href={authRoutes.login} prefetch={true}>
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 group"
                            >
                                Jetzt starten
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="#features" prefetch={true}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6"
                            >
                                Funktionen entdecken
                            </Button>
                        </Link>
                    </motion.div>{" "}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-wrap justify-center gap-6 text-sm text-gray-600"
                    >
                        {[
                            "DSGVO-konform",
                            "Rechtssichere Protokolle",
                            "Digitale Abstimmungen",
                            "Cloud-basiert",
                        ].map((feature, index) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: 0.8 + index * 0.1,
                                }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>{feature}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
