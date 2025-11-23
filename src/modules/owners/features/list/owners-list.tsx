"use client";

import Link from "next/link";
import { Mail, Phone, Building, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Owner } from "../../shared/schemas/owner.schema";

interface OwnersListProps {
    owners: Owner[];
}

export function OwnersList({ owners }: OwnersListProps) {
    if (owners.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Eigentümer</h3>
                <p className="text-muted-foreground mb-4">
                    Füge deinen ersten Eigentümer hinzu, um loszulegen.
                </p>
                <Link
                    href="/dashboard/owners/new"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Eigentümer hinzufügen
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {owners.map((owner) => (
                <Link key={owner.id} href={`/dashboard/owners/${owner.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="truncate">
                                    {owner.firstName} {owner.lastName}
                                </span>
                                <Badge variant="secondary">
                                    {owner.ownershipShares}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {owner.unit && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building className="h-4 w-4" />
                                    <span className="truncate">{owner.unit}</span>
                                </div>
                            )}
                            {owner.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{owner.email}</span>
                                </div>
                            )}
                            {owner.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span className="truncate">{owner.phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
