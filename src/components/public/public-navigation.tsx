"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { useState } from "react";
import authRoutes from "@/modules/auth/shared/auth.route";

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Building2 className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold text-gray-900">
                            Eigentümerversammlungen
                        </span>
                    </Link>
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/#features"
                            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                        >
                            Funktionen
                        </Link>
                        <Link
                            href={authRoutes.login}
                            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                        >
                            Anmelden
                        </Link>
                        <Link href={authRoutes.login}>
                            <Button className="shadow-sm">Jetzt starten</Button>
                        </Link>
                    </div>{" "}
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Menu"
                    >
                        <Menu className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200 py-4"
                    >
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/#features"
                                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Funktionen
                            </Link>
                            <Link
                                href={authRoutes.login}
                                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Anmelden
                            </Link>
                            <Link
                                href={authRoutes.login}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button className="w-full">
                                    Jetzt starten
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
