import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getProperty } from "../../shared/property.action";
import { PropertyForm } from "../../shared/components/property-form";
import propertiesRoutes from "../../properties.route";

interface EditPropertyPageProps {
    propertyId: number;
}

export default async function EditPropertyPage({
    propertyId,
}: EditPropertyPageProps) {
    const user = await requireAuth();
    const property = await getProperty(propertyId);

    if (!property) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href={propertiesRoutes.detail(propertyId)}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Detailansicht
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Liegenschaft bearbeiten</h1>
                <p className="text-gray-600 mt-1">{property.name}</p>
            </div>

            <PropertyForm
                organizationId={property.organizationId}
                initialData={property}
            />
        </div>
    );
}
