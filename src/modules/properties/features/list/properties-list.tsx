"use client";

import {
    Building2,
    LayoutGrid,
    MapPin,
    Table as TableIcon,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import propertiesRoutes from "../../properties.route";
import type { Property } from "../../shared/schemas/property.schema";

interface PropertiesListProps {
    properties: Property[];
}

export function PropertiesList({ properties }: PropertiesListProps) {
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

    // Load view mode from localStorage on mount
    useEffect(() => {
        const savedViewMode = localStorage.getItem("properties-view-mode");
        if (savedViewMode === "cards" || savedViewMode === "table") {
            setViewMode(savedViewMode);
        }
    }, []);

    // Save view mode to localStorage when it changes
    const handleViewModeChange = (mode: "cards" | "table") => {
        setViewMode(mode);
        localStorage.setItem("properties-view-mode", mode);
    };

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
        <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="inline-flex rounded-lg border p-1 bg-muted/50">
                    <Button
                        variant={viewMode === "cards" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("cards")}
                        className="gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("table")}
                        className="gap-2"
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Cards View */}
            {viewMode === "cards" && (
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
                                            {property.street}{" "}
                                            {property.houseNumber}
                                            <br />
                                            {property.postalCode}{" "}
                                            {property.city}
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
                                                    {property.numberOfUnits}{" "}
                                                    Einheiten
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
            )}

            {/* Table View */}
            {viewMode === "table" && (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Adresse</TableHead>
                                <TableHead>Ort</TableHead>
                                <TableHead>Baujahr</TableHead>
                                <TableHead>Einheiten</TableHead>
                                <TableHead>Fläche</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {properties.map((property) => (
                                <TableRow
                                    key={property.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                        window.location.href =
                                            propertiesRoutes.detail(
                                                property.id,
                                            );
                                    }}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-blue-600" />
                                            {property.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {property.street} {property.houseNumber}
                                    </TableCell>
                                    <TableCell>
                                        {property.postalCode} {property.city}
                                    </TableCell>
                                    <TableCell>
                                        {property.yearBuilt || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {property.numberOfUnits ? (
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {property.numberOfUnits}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {property.totalArea
                                            ? `${property.totalArea.toLocaleString()} m²`
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
