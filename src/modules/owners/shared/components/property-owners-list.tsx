"use client";

import { useState } from "react";
import { Edit, Mail, Phone, Plus, Trash2, Users, Building2 } from "lucide-react";
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
import { OwnerDialog } from "./owner-dialog";
import { deleteOwner } from "../owner.action";
import type { Owner } from "../schemas/owner.schema";

interface PropertyOwnersListProps {
    propertyId: number;
    initialOwners: Owner[];
}

export function PropertyOwnersList({
    propertyId,
    initialOwners,
}: PropertyOwnersListProps) {
    const [owners, setOwners] = useState<Owner[]>(initialOwners);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState<Owner | undefined>(undefined);
    const [deletingOwnerId, setDeletingOwnerId] = useState<number | null>(null);

    const handleAddClick = () => {
        setEditingOwner(undefined);
        setIsDialogOpen(true);
    };

    const handleEditClick = (owner: Owner) => {
        setEditingOwner(owner);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        // Refresh owners list
        window.location.reload();
    };

    const handleDeleteClick = (ownerId: number) => {
        setDeletingOwnerId(ownerId);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingOwnerId) return;

        try {
            const result = await deleteOwner(deletingOwnerId);
            if (result.success) {
                toast.success("Eigentümer erfolgreich gelöscht");
                setOwners(owners.filter((o) => o.id !== deletingOwnerId));
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
                <div>
                    <p className="text-sm text-muted-foreground">
                        {owners.length} {owners.length === 1 ? "Eigentümer" : "Eigentümer"}
                    </p>
                </div>
                <Button size="sm" onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Eigentümer hinzufügen
                </Button>
            </div>

            {owners.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="mb-4">Keine Eigentümer erfasst</p>
                    <Button size="sm" variant="outline" onClick={handleAddClick}>
                        Ersten Eigentümer hinzufügen
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {owners.map((owner) => (
                        <div
                            key={owner.id}
                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold">
                                        {owner.firstName} {owner.lastName}
                                    </h3>
                                    <Badge variant="secondary">
                                        {owner.ownershipShares} Anteile
                                    </Badge>
                                </div>
                                {owner.unit && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <Building2 className="inline h-3 w-3 mr-1" />
                                        {owner.unit}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(owner)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(owner.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <OwnerDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                propertyId={propertyId}
                owner={editingOwner}
                onSuccess={handleSuccess}
            />

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
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
