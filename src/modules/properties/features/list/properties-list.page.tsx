import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import { getProperties } from "../../shared/property.action";
import propertiesRoutes from "../../properties.route";
import { PropertiesList } from "./properties-list";

export default async function PropertiesListPage() {
    const user = await requireAuth();

    // Get user's first organization
    const organizations = await getUserOrganizations();
    const organization = organizations[0];

    if (!organization) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Liegenschaften</h1>
                    <p className="text-gray-600">
                        Du musst zuerst einer Organisation beitreten.
                    </p>
                </div>
            </div>
        );
    }

    const properties = await getProperties(organization.id);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Building2 className="h-8 w-8" />
                        Liegenschaften
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Verwalte deine Immobilien und Grundstücke
                    </p>
                </div>
                {properties.length > 0 && (
                    <Link href={propertiesRoutes.new}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Neue Liegenschaft
                        </Button>
                    </Link>
                )}
            </div>

            <PropertiesList properties={properties} />
        </div>
    );
}
