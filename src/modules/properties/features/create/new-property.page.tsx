import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import { PropertyForm } from "../../shared/components/property-form";
import propertiesRoutes from "../../properties.route";

export default async function NewPropertyPage() {
    const user = await requireAuth();

    const organizations = await getUserOrganizations();
    const organization = organizations[0];

    if (!organization) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        Neue Liegenschaft
                    </h1>
                    <p className="text-gray-600">
                        Du musst zuerst einer Organisation beitreten.
                    </p>
                </div>
            </div>
        );
    }

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

            <PropertyForm organizationId={organization.id} />
        </div>
    );
}
