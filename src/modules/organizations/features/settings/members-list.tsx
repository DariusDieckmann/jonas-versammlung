"use client";

import { Trash2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { OrganizationMemberWithUser } from "../../shared/models/organization.model";
import {
    removeOrganizationMember,
    updateMemberRole,
} from "../../shared/organization.action";

interface MembersListProps {
    members: OrganizationMemberWithUser[];
    currentUserId: string;
    isCurrentUserOwner: boolean;
    onRoleChange?: () => void;
}

export function MembersList({
    members,
    currentUserId,
    isCurrentUserOwner,
    onRoleChange,
}: MembersListProps) {
    const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(
        null,
    );
    const [removingMemberId, setRemovingMemberId] = useState<number | null>(
        null,
    );

    const handleRoleChange = async (
        memberId: number,
        userId: string,
        organizationId: number,
        newRole: "owner" | "member",
    ) => {
        setUpdatingMemberId(memberId);
        try {
            const result = await updateMemberRole(
                organizationId,
                userId,
                newRole,
            );

            if (!result.success) {
                toast.error(
                    result.error || "Rolle konnte nicht geändert werden",
                );
                return;
            }

            toast.success("Rolle erfolgreich geändert");
            if (onRoleChange) {
                onRoleChange();
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        } finally {
            setUpdatingMemberId(null);
        }
    };

    const handleRemoveMember = async (
        organizationId: number,
        userId: string,
        memberName: string,
    ) => {
        setRemovingMemberId(organizationId);
        try {
            const result = await removeOrganizationMember(
                organizationId,
                userId,
            );

            if (!result.success) {
                toast.error(
                    result.error || "Mitglied konnte nicht entfernt werden",
                );
                return;
            }

            toast.success(`${memberName} wurde aus der Organisation entfernt`);
            if (onRoleChange) {
                onRoleChange();
            }
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        } finally {
            setRemovingMemberId(null);
        }
    };

    return (
        <div className="space-y-2">
            {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canChangeRole = isCurrentUserOwner && !isCurrentUser;

                return (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                        <div className="flex-1">
                            <div className="font-medium">
                                {member.user.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                {member.user.email}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {canChangeRole ? (
                                <>
                                    <Select
                                        value={member.role}
                                        onValueChange={(value) =>
                                            handleRoleChange(
                                                member.id,
                                                member.userId,
                                                member.organizationId,
                                                value as "owner" | "member",
                                            )
                                        }
                                        disabled={
                                            updatingMemberId === member.id
                                        }
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="owner">
                                                Eigentümer
                                            </SelectItem>
                                            <SelectItem value="member">
                                                Mitglied
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                disabled={
                                                    removingMemberId ===
                                                    member.id
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Mitglied entfernen?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Möchtest du{" "}
                                                    <strong>
                                                        {member.user.name}
                                                    </strong>{" "}
                                                    wirklich aus der
                                                    Organisation entfernen?
                                                    Diese Aktion kann nicht
                                                    rückgängig gemacht werden.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Abbrechen
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            member.organizationId,
                                                            member.userId,
                                                            member.user.name,
                                                        )
                                                    }
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Entfernen
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                    {member.role === "owner"
                                        ? "Eigentümer"
                                        : "Mitglied"}
                                    {isCurrentUser && " (Du)"}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
