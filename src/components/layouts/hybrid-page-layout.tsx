import { Navigation as LandingNavigation } from "@/components/landing/navigation";
import { Navigation as AuthNavigation } from "@/components/navigation";
import { LandingFooter } from "@/components/landing/footer";
import { getCurrentUser } from "@/modules/auth/shared/utils/auth-utils";

export async function HybridPageLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    return (
        <div className="min-h-screen flex flex-col">
            {user ? <AuthNavigation /> : <LandingNavigation />}
            <main className="flex-1 pt-16 md:pt-0">{children}</main>
            <LandingFooter />
        </div>
    );
}
