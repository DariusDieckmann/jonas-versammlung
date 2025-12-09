"use client";

import {
    BookOpen,
    Building,
    Building2,
    CalendarDays,
    Home,
    LifeBuoy,
    Menu,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import publicRoutes from "@/lib/public.route";
import LogoutButton from "@/modules/auth/features/logout/logout-button";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";
import meetingsRoutes from "@/modules/meetings/shared/meetings.route";
import settingsRoutes from "@/modules/organizations/shared/settings.route";
import propertiesRoutes from "@/modules/properties/shared/properties.route";

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link
                            href={dashboardRoutes.dashboard}
                            className="text-xl font-bold text-gray-900"
                        >
                            Triple-D
                        </Link>
                        {/* Desktop Navigation */}
                        <div className="items-center space-x-4 hidden xl:flex">
                            <Link href={dashboardRoutes.dashboard}>
                                <Button variant="ghost" size="sm">
                                    <Home className="mr-2 h-4 w-4" />
                                    Startseite
                                </Button>
                            </Link>
                            <Link href={propertiesRoutes.list}>
                                <Button variant="ghost" size="sm">
                                    <Building className="mr-2 h-4 w-4" />
                                    Liegenschaften
                                </Button>
                            </Link>
                            <Link href={meetingsRoutes.list}>
                                <Button variant="ghost" size="sm">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    Versammlungen
                                </Button>
                            </Link>
                            <Link href={settingsRoutes.organization}>
                                <Button variant="ghost" size="sm">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Eigene Organisation
                                </Button>
                            </Link>
                            <Link href={publicRoutes.dokumentation.index}>
                                <Button variant="ghost" size="sm">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Dokumentation
                                </Button>
                            </Link>
                            <Link href={publicRoutes.hilfeCenter}>
                                <Button variant="ghost" size="sm">
                                    <LifeBuoy className="mr-2 h-4 w-4" />
                                    Hilfe
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Menu"
                        >
                            <Menu className="h-6 w-6 text-gray-600" />
                        </button>

                        <LogoutButton />
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="xl:hidden border-t border-gray-200 py-4 mt-3">
                        <div className="flex flex-col gap-2">
                            <Link
                                href={dashboardRoutes.dashboard}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Startseite
                                </Button>
                            </Link>
                            <Link
                                href={propertiesRoutes.list}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    <Building className="mr-2 h-4 w-4" />
                                    Liegenschaften
                                </Button>
                            </Link>
                            <Link
                                href={meetingsRoutes.list}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    Versammlungen
                                </Button>
                            </Link>
                            <Link
                                href={settingsRoutes.organization}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Eigene Organisation
                                </Button>
                            </Link>
                            <Link
                                href={publicRoutes.dokumentation.index}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Dokumentation
                                </Button>
                            </Link>
                            <Link
                                href={publicRoutes.hilfeCenter}
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    <LifeBuoy className="mr-2 h-4 w-4" />
                                    Hilfe
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
