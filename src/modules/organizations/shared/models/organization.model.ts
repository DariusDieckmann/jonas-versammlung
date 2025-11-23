export const OrganizationRole = {
    OWNER: "owner",
    MEMBER: "member",
} as const;

export type OrganizationRoleType =
    (typeof OrganizationRole)[keyof typeof OrganizationRole];

export interface OrganizationWithMemberCount extends Organization {
    memberCount: number;
}

export interface OrganizationMemberWithUser extends OrganizationMember {
    user: {
        id: string;
        name: string;
        email: string;
    };
}

import type {
    Organization,
    OrganizationMember,
} from "../schemas/organization.schema";
