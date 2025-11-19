"use server";

import type {
    AuthResponse,
    SignInSchema,
    SignUpSchema,
} from "@/modules/auth/shared/models/auth.model";
import { getAuthInstance } from "@/modules/auth/shared/utils/auth-utils";

// #region SERVER ACTIONS

export const signIn = async ({
    email,
    password,
}: SignInSchema): Promise<AuthResponse> => {
    try {
        const auth = await getAuthInstance();
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
        });

        return {
            success: true,
            message: "Signed in succesfully",
        };
    } catch (error) {
        // Log the actual error server-side for debugging
        console.error("Sign in error:", error);
        
        // Return a generic error message to the client or specific if possible
        const err = error as Error;
        const messageText = (err?.message ?? String(err)).toLowerCase();

        return {
            success: false,
            message: messageText.includes("invalid email or password") ? "Invalid email or password." : "Unbekannter Fehler.",
        };
    }
};

export const signUp = async ({
    email,
    password,
    username,
}: SignUpSchema): Promise<AuthResponse> => {
    try {
        const auth = await getAuthInstance();
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: username,
            },
        });

        return {
            success: true,
            message: "Registration successful! Please check your email to verify your account.",
        };
    } catch (error) {
        // Log the actual error server-side for debugging
        console.error("Sign up error:", error);
        
        // Return a generic error message to the client
        // Note: Better Auth might throw specific user-friendly errors like "Email already exists"
        // We still log the full error but show a safe message
        const err = error as Error;
        const message = err.message?.toLowerCase().includes("already") 
            ? "This email is already registered."
            : "Registration failed. Please try again.";
        
        return {
            success: false,
            message,
        };
    }
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
        // Log the actual error server-side for debugging
        console.error("Sign out error:", error);
        
        // Return a generic error message to the client
        return {
            success: false,
            message: "Failed to sign out. Please try again.",
        };
    }
};
// #endregion
