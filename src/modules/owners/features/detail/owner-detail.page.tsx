import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building, Mail, Phone, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOwner, deleteOwner } from "../../shared/owner.action";
import { getProperty } from "@/modules/properties/shared/property.action";

interface OwnerDetailPageProps {
    params: {
        ownerId: string;
    };
}

export default async function OwnerDetailPage({
    params,
}: OwnerDetailPageProps) {
    await requireAuth();
    const ownerId = parseInt(params.ownerId);

    if (isNaN(ownerId)) {
        notFound();
    }

    const owner = await getOwner(ownerId);

    if (!owner) {
        notFound();
    }

    // Get property details
    const property = await getProperty(owner.propertyId);

    async function handleDelete() {
        "use server";
        const result = await deleteOwner(ownerId);
        if (result.success) {
            redirect("/dashboard/owners");
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <Link href="/dashboard/owners">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Übersicht
                </Button>
            </Link>

            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        {owner.firstName} {owner.lastName}
                    </h1>
                    <p className="text-gray-600 mt-1">Eigentümer-Details</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/owners/${owner.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                        </Button>
                    </Link>
                    <form action={handleDelete}>
                        <Button type="submit" variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Eigentumsverhältnisse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Liegenschaft
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                {property ? (
                                    <Link
                                        href={`/dashboard/properties/${property.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {property.name}
                                    </Link>
                                ) : (
                                    <span>Liegenschaft nicht gefunden</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Miteigentumsanteile
                            </label>
                            <div className="mt-1">
                                <Badge variant="secondary" className="text-base">
                                    {owner.ownershipShares}
                                </Badge>
                            </div>
                        </div>

                        {owner.unit && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Einheit/Wohnung
                                </label>
                                <p className="mt-1">{owner.unit}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kontaktdaten</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Name
                            </label>
                            <p className="mt-1">
                                {owner.firstName} {owner.lastName}
                            </p>
                        </div>

                        {owner.email && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    E-Mail
                                </label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <a
                                        href={`mailto:${owner.email}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {owner.email}
                                    </a>
                                </div>
                            </div>
                        )}

                        {owner.phone && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Telefon
                                </label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <a
                                        href={`tel:${owner.phone}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {owner.phone}
                                    </a>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {owner.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notizen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{owner.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Metadaten</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Erstellt am</span>
                            <span>
                                {new Date(owner.createdAt).toLocaleDateString("de-DE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Zuletzt aktualisiert</span>
                            <span>
                                {new Date(owner.updatedAt).toLocaleDateString("de-DE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
