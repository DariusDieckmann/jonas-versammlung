import { AppFooter } from "@/components/auth/auth-footer";
import { AuthNavigation } from "@/components/auth/auth-navigation";

export function AuthPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <AuthNavigation />
            <div className="flex-1 pt-4">{children}</div>
            <AppFooter />
        </div>
    );
}
