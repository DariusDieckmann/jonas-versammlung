import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { Button } from "@/components/ui/button";
import { getOwner } from "../../shared/owner.action";
import { OwnerForm } from "../../shared/components/owner-form";

interface EditOwnerPageProps {
    params: {
        ownerId: string;
    };
}

export default async function EditOwnerPage({ params }: EditOwnerPageProps) {
    await requireAuth();
    const ownerId = parseInt(params.ownerId);

    if (isNaN(ownerId)) {
        notFound();
    }

    const owner = await getOwner(ownerId);

    if (!owner) {
        notFound();
    }

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <Link href={`/dashboard/owners/${owner.id}`}>
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                </Button>
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Eigentümer bearbeiten</h1>
                <p className="text-gray-600 mt-1">
                    Bearbeite die Daten von {owner.firstName} {owner.lastName}
                </p>
            </div>

            <OwnerForm initialData={owner} />
        </div>
    );
}
