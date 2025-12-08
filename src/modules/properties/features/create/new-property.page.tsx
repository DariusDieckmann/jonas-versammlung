import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import propertiesRoutes from "../../shared/properties.route";
import { PropertyForm } from "../../shared/components/property-form";

export default async function NewPropertyPage() {
    await requireAuth();

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href={propertiesRoutes.list}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Neue Liegenschaft</h1>
                <p className="text-gray-600 mt-1">
                    Füge eine neue Immobilie zu deiner Verwaltung hinzu
                </p>
            </div>

            <PropertyForm />
        </div>
    );
}
