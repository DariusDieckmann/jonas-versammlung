"use client";

import { useState } from "react";
import { Edit, Mail, Phone, Plus, Trash2, Users, Building2, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitDialog } from "./unit-dialog";
import { OwnerDialog } from "@/modules/owners/shared/components/owner-dialog";
import { deleteUnit } from "../unit.action";
import { deleteOwner } from "@/modules/owners/shared/owner.action";
import type { Unit } from "../schemas/unit.schema";
import type { Owner } from "@/modules/owners/shared/schemas/owner.schema";

interface UnitWithOwners extends Unit {
    owners: Owner[];
}

interface PropertyUnitsListProps {
    propertyId: number;
    initialUnitsWithOwners: UnitWithOwners[];
}

export function PropertyUnitsList({
    propertyId,
    initialUnitsWithOwners,
}: PropertyUnitsListProps) {
    const [units, setUnits] = useState<UnitWithOwners[]>(initialUnitsWithOwners);
    const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | undefined>(undefined);
    const [deletingUnitId, setDeletingUnitId] = useState<number | null>(null);
    
    const [isOwnerDialogOpen, setIsOwnerDialogOpen] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(undefined);
    const [editingOwner, setEditingOwner] = useState<Owner | undefined>(undefined);
    const [deletingOwnerId, setDeletingOwnerId] = useState<number | null>(null);

    const handleAddUnitClick = () => {
        setEditingUnit(undefined);
        setIsUnitDialogOpen(true);
    };

    const handleEditUnitClick = (unit: Unit) => {
        setEditingUnit(unit);
        setIsUnitDialogOpen(true);
    };

    const handleAddOwnerClick = (unitId: number) => {
        setSelectedUnitId(unitId);
        setEditingOwner(undefined);
        setIsOwnerDialogOpen(true);
    };

    const handleEditOwnerClick = (owner: Owner) => {
        setSelectedUnitId(owner.unitId);
        setEditingOwner(owner);
        setIsOwnerDialogOpen(true);
    };

    const handleSuccess = () => {
        // Refresh page
        window.location.reload();
    };

    const handleDeleteUnitClick = (unitId: number) => {
        setDeletingUnitId(unitId);
    };

    const handleDeleteUnitConfirm = async () => {
        if (!deletingUnitId) return;

        try {
            const result = await deleteUnit(deletingUnitId);
            if (result.success) {
                toast.success("Einheit erfolgreich gelöscht");
                setUnits(units.filter((u) => u.id !== deletingUnitId));
                setDeletingUnitId(null);
            } else {
                toast.error(result.error || "Fehler beim Löschen");
            }
        } catch (error) {
            console.error("Error deleting unit:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        }
    };

    const handleDeleteOwnerClick = (ownerId: number) => {
        setDeletingOwnerId(ownerId);
    };

    const handleDeleteOwnerConfirm = async () => {
        if (!deletingOwnerId) return;

        try {
            const result = await deleteOwner(deletingOwnerId);
            if (result.success) {
                toast.success("Eigentümer erfolgreich gelöscht");
                // Update units state to remove owner
                setUnits(units.map(unit => ({
                    ...unit,
                    owners: unit.owners.filter(o => o.id !== deletingOwnerId)
                })));
                setDeletingOwnerId(null);
            } else {
                toast.error(result.error || "Fehler beim Löschen");
            }
        } catch (error) {
            console.error("Error deleting owner:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                    {units.length} {units.length === 1 ? "Einheit" : "Einheiten"}
                </p>
                <Button size="sm" onClick={handleAddUnitClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Einheit hinzufügen
                </Button>
            </div>

            {units.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="mb-4">Keine Einheiten erfasst</p>
                    <Button size="sm" variant="outline" onClick={handleAddUnitClick}>
                        Erste Einheit hinzufügen
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {units.map((unit) => (
                        <Card key={unit.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-3">
                                            <span>{unit.name}</span>
                                            <Badge variant="secondary">
                                                MEA: {unit.ownershipShares}
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                            {unit.floor !== null && <span>Etage: {unit.floor}</span>}
                                            {unit.area && <span>Fläche: {unit.area} m²</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditUnitClick(unit)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUnitClick(unit.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium">
                                        Eigentümer ({unit.owners.length})
                                    </h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOwnerClick(unit.id)}
                                    >
                                        <User className="mr-2 h-3 w-3" />
                                        Eigentümer hinzufügen
                                    </Button>
                                </div>

                                {unit.owners.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg border-dashed">
                                        <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>Keine Eigentümer</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {unit.owners.map((owner) => (
                                            <div
                                                key={owner.id}
                                                className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">
                                                            {owner.firstName} {owner.lastName}
                                                        </span>
                                                        {owner.sharePercentage && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {owner.sharePercentage}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                        {owner.email && (
                                                            <a
                                                                href={`mailto:${owner.email}`}
                                                                className="flex items-center gap-1 hover:text-blue-600"
                                                            >
                                                                <Mail className="h-3 w-3" />
                                                                {owner.email}
                                                            </a>
                                                        )}
                                                        {owner.phone && (
                                                            <a
                                                                href={`tel:${owner.phone}`}
                                                                className="flex items-center gap-1 hover:text-blue-600"
                                                            >
                                                                <Phone className="h-3 w-3" />
                                                                {owner.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditOwnerClick(owner)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteOwnerClick(owner.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <UnitDialog
                open={isUnitDialogOpen}
                onOpenChange={setIsUnitDialogOpen}
                propertyId={propertyId}
                unit={editingUnit}
                onSuccess={handleSuccess}
            />

            {selectedUnitId && (
                <OwnerDialog
                    open={isOwnerDialogOpen}
                    onOpenChange={setIsOwnerDialogOpen}
                    unitId={selectedUnitId}
                    owner={editingOwner}
                    onSuccess={handleSuccess}
                />
            )}

            <AlertDialog
                open={deletingUnitId !== null}
                onOpenChange={() => setDeletingUnitId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Einheit löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bist du sicher, dass du diese Einheit löschen möchtest?
                            Alle zugehörigen Eigentümer werden ebenfalls gelöscht.
                            Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUnitConfirm}>
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={deletingOwnerId !== null}
                onOpenChange={() => setDeletingOwnerId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eigentümer löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bist du sicher, dass du diesen Eigentümer löschen möchtest?
                            Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOwnerConfirm}>
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
