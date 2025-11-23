import { Plus } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { Button } from "@/components/ui/button";
import { getOwners } from "../../shared/owner.action";
import { OwnersList } from "./owners-list";

export default async function OwnersListPage() {
    await requireAuth();
    const owners = await getOwners();

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Eigentümer</h1>
                    <p className="text-gray-600 mt-1">
                        Verwalte alle Eigentümer deiner Liegenschaften
                    </p>
                </div>
                <Link href="/dashboard/owners/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Eigentümer hinzufügen
                    </Button>
                </Link>
            </div>

            <OwnersList owners={owners} />
        </div>
    );
}
