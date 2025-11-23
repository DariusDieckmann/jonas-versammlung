"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateMemberRole } from "../../shared/organization.action";
import type { OrganizationMemberWithUser } from "../../shared/models/organization.model";

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
                toast.error(result.error || "Rolle konnte nicht geändert werden");
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
                            <div className="font-medium">{member.user.name}</div>
                            <div className="text-sm text-gray-600">
                                {member.user.email}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {canChangeRole ? (
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
                                    disabled={updatingMemberId === member.id}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="owner">Eigentümer</SelectItem>
                                        <SelectItem value="member">Mitglied</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                    {member.role === "owner" ? "Eigentümer" : "Mitglied"}
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
