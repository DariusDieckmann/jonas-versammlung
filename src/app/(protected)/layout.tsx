import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import authRoutes from "@/modules/auth/shared/auth.route";
import { getSession } from "@/modules/auth/shared/utils/auth-utils";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect(authRoutes.login);
    }

    return (
        <>
            <Navigation />
            {children}
        </>
    );
}
