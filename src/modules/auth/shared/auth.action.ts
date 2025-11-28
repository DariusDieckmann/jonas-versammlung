"use server";

import { getAuthInstance } from "@/modules/auth/shared/utils/auth-utils";

export type AuthResponse = {
    success: boolean;
    message: string;
};

export const signOut = async (): Promise<AuthResponse> => {
    try {
        const auth = await getAuthInstance();
        await auth.api.signOut({
            headers: await import("next/headers").then((m) => m.headers()),
        });

        return {
            success: true,
            message: "Signed out successfully",
        };
    } catch (error) {
        console.error("Sign out error:", error);

        return {
            success: false,
            message: "Failed to sign out. Please try again.",
        };
    }
};
