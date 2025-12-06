"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Mail, FileText, HelpCircle, Shield } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 className="h-8 w-8 text-blue-500" />
                                <span className="text-2xl font-bold text-white">
                                    Eigentümerversammlungen
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                Moderne Digitalisierung für Hausverwaltungen und
                                Eigentümerversammlungen. Effizient, transparent und
                                rechtssicher.
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <a
                                    href="mailto:info@versammlung.de"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    info@versammlung.de
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Produkt */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Produkt
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link
                                        href="#features"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Funktionen
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Preise
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/login"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Anmelden
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/login"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Kostenlos testen
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Support */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Support
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link
                                        href="/hilfe-center"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Hilfe-Center
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/dokumentation"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Dokumentation
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="mailto:support@versammlung.de"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Support kontaktieren
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/faq"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Rechtliches */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Rechtliches
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link
                                        href="/impressum"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Impressum
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/datenschutz"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Datenschutzerklärung
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/agb"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        AGB
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="border-t border-gray-800 pt-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} Eigentümerversammlungen. Alle
                            Rechte vorbehalten.
                        </p>
                        <p className="text-xs text-gray-500">
                            Made with ❤️ in Deutschland
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
