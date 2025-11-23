"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { removeOrganizationMember } from "../../shared/organization.action";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";

interface LeaveOrganizationButtonProps {
    organizationId: number;
    organizationName: string;
    onSuccess?: () => void;
}

export function LeaveOrganizationButton({
    organizationId,
    organizationName,
    onSuccess,
}: LeaveOrganizationButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleLeave = async () => {
        setIsLoading(true);
        try {
            // We need to get the current user's ID
            // Since this is client-side, we'll pass a special flag to the server action
            const result = await removeOrganizationMember(
                organizationId,
                "current-user", // Special marker that the server will handle
            );

            if (!result.success) {
                toast.error(result.error || "Organisation konnte nicht verlassen werden");
                setIsLoading(false);
                return;
            }

            toast.success("Du hast die Organisation verlassen");
            setOpen(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error leaving organization:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Organisation verlassen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bist du dir absolut sicher?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Du bist dabei, <strong>{organizationName}</strong> zu verlassen.
                        <br />
                        <br />
                        Diese Aktion kann nicht rückgängig gemacht werden. Du verlierst den
                        Zugriff auf alle Todos und Kategorien in dieser Organisation. Wenn
                        du das letzte Mitglied bist, wird die Organisation und alle ihre
                        Daten gelöscht.
                        <br />
                        <br />
                        Du kannst danach eine neue Organisation erstellen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleLeave();
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? "Verlasse..." : "Organisation verlassen"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
