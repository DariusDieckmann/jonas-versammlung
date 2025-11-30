import { Building, Building2, CalendarDays, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "../modules/auth/features/logout/logout-button";
import dashboardRoutes from "@/modules/dashboard/shared/dashboard.route";
import propertiesRoutes from "@/modules/properties/properties.route";
import meetingsRoutes from "@/modules/meetings/meetings.route";
import settingsRoutes from "@/modules/organizations/shared/settings.route";

export function Navigation() {
    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href={dashboardRoutes.dashboard} className="text-xl font-bold text-gray-900">
                            Triple-D
                        </Link>
                        <div className="items-center space-x-4 hidden md:flex">
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
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </nav>
    );
}
