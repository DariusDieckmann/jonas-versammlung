import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { OwnerForm } from "../../shared/components/owner-form";

export default async function NewOwnerPage() {
    await requireAuth();

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Neuen Eigentümer hinzufügen</h1>
                <p className="text-gray-600 mt-1">
                    Erfasse die Daten eines neuen Eigentümers
                </p>
            </div>

            <OwnerForm />
        </div>
    );
}
