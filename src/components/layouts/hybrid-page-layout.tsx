import { LandingFooter as PublicFooter } from "@/components/public/public-footer";
import { Navigation as PublicNavigation } from "@/components/public/public-navigation";
import { getCurrentUser } from "@/modules/auth/shared/utils/auth-utils";
import { AuthPageLayout } from "./auth-page-layout";

export async function HybridPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (user) {
        return <AuthPageLayout>{children}</AuthPageLayout>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavigation />
            <main className="flex-1 pt-16">{children}</main>
            <PublicFooter />
        </div>
    );
}
