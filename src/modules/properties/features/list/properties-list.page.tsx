import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import propertiesRoutes from "../../properties.route";
import { getProperties } from "../../shared/property.action";
import { PropertiesList } from "./properties-list";

export default async function PropertiesListPage() {
    await requireAuth();
    const properties = await getProperties();

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
