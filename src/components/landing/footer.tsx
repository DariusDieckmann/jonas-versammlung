"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
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
                            <p className="text-gray-400 mb-4 max-w-md">
                                Moderne Digitalisierung für Hausverwaltungen und
                                Eigentümerversammlungen. Effizient, transparent und
                                rechtssicher.
                            </p>
                        </motion.div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h3 className="text-white font-semibold mb-4">Links</h3>
                            <ul className="space-y-2">
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
                                        href="/login"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        Anmelden
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Contact */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="text-white font-semibold mb-4">Kontakt</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                    <a
                                        href="mailto:info@versammlung.de"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        info@versammlung.de
                                    </a>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Eigentümerversammlungen. Alle Rechte
                        vorbehalten.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link
                            href="/datenschutz"
                            className="hover:text-blue-400 transition-colors"
                        >
                            Datenschutz
                        </Link>
                        <Link
                            href="/impressum"
                            className="hover:text-blue-400 transition-colors"
                        >
                            Impressum
                        </Link>
                        <Link
                            href="/agb"
                            className="hover:text-blue-400 transition-colors"
                        >
                            AGB
                        </Link>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
