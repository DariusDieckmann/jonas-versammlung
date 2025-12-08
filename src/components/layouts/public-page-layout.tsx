import { Navigation } from "@/components/layouts/navigation";
import { LandingFooter } from "@/components/layouts/footer";

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 pt-16">{children}</main>
            <LandingFooter />
        </div>
    );
}
