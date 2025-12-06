import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { InvitePage } from "@/modules/organizations/features/invite/invite.page";

export default async function InviteRoute({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    await requireAuth();
    const { code } = await params;

    return <InvitePage invitationCode={code} />;
}
