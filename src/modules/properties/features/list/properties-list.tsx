"use client";

import { Building2, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { Property } from "../../shared/schemas/property.schema";
import propertiesRoutes from "../../properties.route";

interface PropertiesListProps {
    properties: Property[];
}

export function PropertiesList({ properties }: PropertiesListProps) {
    if (properties.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Keine Liegenschaften
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    Erstelle deine erste Liegenschaft um zu beginnen
                </p>
                <div className="mt-6">
                    <Link href={propertiesRoutes.new}>
                        <Button>
                            <Building2 className="mr-2 h-4 w-4" />
                            Erste Liegenschaft erstellen
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
                <Link
                    key={property.id}
                    href={propertiesRoutes.detail(property.id)}
                >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                {property.name}
                            </CardTitle>
                            <CardDescription className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    {property.street} {property.houseNumber}
                                    <br />
                                    {property.postalCode} {property.city}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-gray-600">
                                {property.yearBuilt && (
                                    <div>
                                        <span className="font-medium">
                                            Baujahr:
                                        </span>{" "}
                                        {property.yearBuilt}
                                    </div>
                                )}
                                {property.numberOfUnits && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {property.numberOfUnits} Einheiten
                                        </span>
                                    </div>
                                )}
                                {property.totalArea && (
                                    <div>
                                        <span className="font-medium">
                                            Fläche:
                                        </span>{" "}
                                        {property.totalArea.toLocaleString()}{" "}
                                        m²
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
