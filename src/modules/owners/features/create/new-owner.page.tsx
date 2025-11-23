import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { OwnerForm } from "../../shared/components/owner-form";

interface NewOwnerPageProps {
    searchParams: {
        propertyId?: string;
    };
}

export default async function NewOwnerPage({ searchParams }: NewOwnerPageProps) {
    await requireAuth();

    const preselectedPropertyId = searchParams.propertyId
        ? parseInt(searchParams.propertyId)
        : undefined;

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Neuen Eigentümer hinzufügen</h1>
                <p className="text-gray-600 mt-1">
                    Erfasse die Daten eines neuen Eigentümers
                </p>
            </div>

            <OwnerForm preselectedPropertyId={preselectedPropertyId} />
        </div>
    );
}
