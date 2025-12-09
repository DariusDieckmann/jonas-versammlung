"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "@/modules/auth/shared/auth.action";
import authRoutes from "../../shared/auth.route";

export default function LogoutButton() {
    const router = useRouter();
    const { refreshAuth } = useAuth();

    const handleLogout = async () => {
        try {
            const result = await signOut();
            if (result.success) {
                // Update the auth context
                await refreshAuth();
                router.push(authRoutes.login);
            } else {
                console.error("Logout failed:", result.message);
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <Button variant="ghost" onClick={handleLogout}>
            Log Out <LogOut className="size-4" />
        </Button>
    );
}
