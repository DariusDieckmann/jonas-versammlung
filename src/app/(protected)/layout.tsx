import { redirect } from "next/navigation";
import { Navigation } from "@/components/protected-navigation";
import { AppFooter } from "@/components/protected-footer";
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
        <div className="flex flex-col min-h-screen">
            <Navigation />
            <div className="flex-1 pt-4">{children}</div>
            <AppFooter />
        </div>
    );
}
