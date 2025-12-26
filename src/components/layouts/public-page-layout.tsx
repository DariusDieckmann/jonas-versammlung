import { LandingFooter } from "@/components/public/public-footer";
import { PublicNavigation } from "@/components/public/public-navigation";

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavigation />
            <main className="flex-1 pt-16">{children}</main>
            <LandingFooter />
        </div>
    );
}
