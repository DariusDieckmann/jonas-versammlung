"use client";

import { AppFooter } from "@/components/auth/auth-footer";
import { LandingFooter } from "@/components/public/public-footer";
import { PublicNavigation } from "../public/public-navigation";
import { AuthNavigation } from "../auth/auth-navigation";
import { useAuth } from "@/contexts/auth-context";

export function HybridPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            {!loading && (isAuthenticated ? <PublicNavigation /> : <AuthNavigation />)}
            <main className="flex-1 pt-16">{children}</main>
            {!loading && (isAuthenticated ? <AppFooter /> : <LandingFooter />)}
        </div>
    );
}
