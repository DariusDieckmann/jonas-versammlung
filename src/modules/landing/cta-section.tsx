"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import authRoutes from "@/modules/auth/shared/auth.route";

export function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 100, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -100, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={
                            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
                        }
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6"
                    >
                        <Sparkles className="h-4 w-4" />
                        Starten Sie noch heute
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
                    >
                        Bereit für die digitale Zukunft?
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
                    >
                        Testen Sie unsere Plattform kostenlos und überzeugen Sie sich
                        selbst von den Vorteilen der digitalen Hausverwaltung.
                    </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href={authRoutes.login}>
                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 group shadow-xl"
                        >
                            Kostenlos starten
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>            
                </motion.div>
            </div>
        </section>
    );
}
