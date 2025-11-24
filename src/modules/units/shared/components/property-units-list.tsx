"use client";

import { useState } from "react";
import { Edit, Trash2, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { UnitDialog } from "./unit-dialog";
import { deleteUnit } from "../unit.action";
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

    const handleAddUnitClick = () => {
        setEditingUnit(undefined);
        setIsUnitDialogOpen(true);
    };

    const handleEditUnitClick = (unit: Unit) => {
        setEditingUnit(unit);
        setIsUnitDialogOpen(true);
    };

    const handleSuccess = () => {
        // Refresh page to show updated data
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

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                    {units.length} {units.length === 1 ? "Einheit" : "Einheiten"}
                </p>
                <Button size="sm" onClick={handleAddUnitClick}>
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
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Etage</TableHead>
                                <TableHead>Fläche</TableHead>
                                <TableHead>MEA</TableHead>
                                <TableHead>Eigentümer</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((unit) => (
                                <TableRow key={unit.id}>
                                    <TableCell className="font-medium">
                                        {unit.name}
                                    </TableCell>
                                    <TableCell>
                                        {unit.floor !== null ? unit.floor : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {unit.area ? `${unit.area} m²` : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {unit.ownershipShares}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {unit.owners.length === 0 ? (
                                            <span className="text-sm text-muted-foreground">
                                                Keine Eigentümer
                                            </span>
                                        ) : (
                                            <div className="space-y-1">
                                                {unit.owners.map((owner) => (
                                                    <div
                                                        key={owner.id}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <span>
                                                            {owner.firstName} {owner.lastName}
                                                        </span>
                                                        {owner.sharePercentage && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {owner.sharePercentage}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditUnitClick(unit)}
                                                title="Einheit bearbeiten"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUnitClick(unit.id)}
                                                title="Einheit löschen"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <UnitDialog
                open={isUnitDialogOpen}
                onOpenChange={setIsUnitDialogOpen}
                propertyId={propertyId}
                unit={editingUnit}
                onSuccess={handleSuccess}
            />

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
        </>
    );
}
