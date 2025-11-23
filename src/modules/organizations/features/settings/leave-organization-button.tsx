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
}

export function LeaveOrganizationButton({
    organizationId,
    organizationName,
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
                toast.error(result.error || "Failed to leave organization");
                setIsLoading(false);
                return;
            }

            toast.success("You have left the organization");
            setOpen(false);
            router.refresh();
            router.push("/dashboard");
        } catch (error) {
            console.error("Error leaving organization:", error);
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Leave Organization</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to leave <strong>{organizationName}</strong>.
                        <br />
                        <br />
                        This action cannot be undone. You will lose access to all
                        todos and categories in this organization. If you are the last
                        member, the organization and all its data will be deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleLeave();
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? "Leaving..." : "Leave Organization"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
