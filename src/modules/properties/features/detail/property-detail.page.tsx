import { ArrowLeft, Building2, Calendar, Edit, MapPin, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { deleteProperty, getProperty } from "../../shared/property.action";
import propertiesRoutes from "../../properties.route";
import { getOwnersByProperty } from "@/modules/owners/shared/owner.action";
import { PropertyOwnersList } from "@/modules/owners/shared/components/property-owners-list";

interface PropertyDetailPageProps {
    propertyId: number;
}

export default async function PropertyDetailPage({
    propertyId,
}: PropertyDetailPageProps) {
    const user = await requireAuth();
    const property = await getProperty(propertyId);

    if (!property) {
        notFound();
    }

    // Get owners for this property
    const owners = await getOwnersByProperty(propertyId);

    async function handleDelete() {
        "use server";
        const result = await deleteProperty(propertyId);
        if (result.success) {
            redirect(propertiesRoutes.list);
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <Link href={propertiesRoutes.list}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Building2 className="h-8 w-8" />
                            {property.name}
                        </h1>
                        <p className="text-gray-600 mt-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {property.street} {property.houseNumber},{" "}
                            {property.postalCode} {property.city}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={propertiesRoutes.edit(property.id)}
                        >
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                            </Button>
                        </Link>
                        <form action={handleDelete}>
                            <Button
                                variant="destructive"
                                size="sm"
                                type="submit"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Basis-Informationen */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basis-Informationen</CardTitle>
                        <CardDescription>
                            Allgemeine Daten zur Liegenschaft
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            {property.yearBuilt && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Baujahr</span>
                                    </div>
                                    <div className="text-lg font-medium">
                                        {property.yearBuilt}
                                    </div>
                                </div>
                            )}

                            {property.numberOfUnits && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Users className="h-4 w-4" />
                                        <span>Anzahl Einheiten</span>
                                    </div>
                                    <div className="text-lg font-medium">
                                        {property.numberOfUnits} Einheiten
                                    </div>
                                </div>
                            )}

                            {property.totalArea && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Building2 className="h-4 w-4" />
                                        <span>Gesamtfläche</span>
                                    </div>
                                    <div className="text-lg font-medium">
                                        {property.totalArea.toLocaleString()} m²
                                    </div>
                                </div>
                            )}
                        </div>

                        {property.notes && (
                            <>
                                <Separator />
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">
                                        Notizen
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {property.notes}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Eigentümer */}
                <Card>
                    <CardHeader>
                        <CardTitle>Eigentümer</CardTitle>
                        <CardDescription>
                            Verwalte die Eigentümer dieser Liegenschaft
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PropertyOwnersList
                            propertyId={property.id}
                            initialOwners={owners}
                        />
                    </CardContent>
                </Card>

                {/* Metadaten */}
                <Card>
                    <CardHeader>
                        <CardTitle>Metadaten</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Erstellt:</span>
                                <br />
                                {new Date(
                                    property.createdAt,
                                ).toLocaleDateString("de-DE", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Zuletzt aktualisiert:
                                </span>
                                <br />
                                {new Date(
                                    property.updatedAt,
                                ).toLocaleDateString("de-DE", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
