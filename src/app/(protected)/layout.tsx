import { redirect } from "next/navigation";
import { AuthPageLayout } from "@/components/layouts/auth-page-layout";
import authRoutes from "@/modules/auth/shared/auth.route";
import { getSession } from "@/modules/auth/shared/utils/auth-utils";

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect(authRoutes.login);
    }

    return <AuthPageLayout>{children}</AuthPageLayout>;
}
