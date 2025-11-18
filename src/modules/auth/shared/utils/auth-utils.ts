/** biome-ignore-all lint/style/noNonNullAssertion: <we will make sure it's not null> */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { getDb } from "@/db";
import type { AuthUser } from "@/modules/auth/shared/models/user.model";
import {
    sendPasswordResetEmail,
    sendVerificationEmail,
} from "@/modules/auth/shared/utils/auth-email.utils";

/**
 * Cached auth instance singleton so we don't create a new instance every time
 */
let cachedAuth: ReturnType<typeof betterAuth> | null = null;

/**
 * Create auth instance dynamically to avoid top-level async issues
 */
async function getAuth() {
    if (cachedAuth) {
        return cachedAuth;
    }

    const { env } = await getCloudflareContext();
    const db = await getDb();

    let baseURL: string;
    
    if (process.env.NODE_ENV === "development") {
        baseURL = "http://localhost:3000";
    } else if (env.NEXTJS_ENV === "preview") {
        baseURL = "https://jonas-versammlung-app-preview.dari-darox.workers.dev";
    } else {
        baseURL = "https://triple-d.ninja";
    }

    cachedAuth = betterAuth({
        baseURL,
        secret: env.BETTER_AUTH_SECRET,
        database: drizzleAdapter(db, {
            provider: "sqlite",
        }),
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
            sendResetPassword: async ({ user, url }) => {
                await sendPasswordResetEmail({
                    to: user.email,
                    resetUrl: url,
                });
            },
        },
        emailVerification: {
            sendOnSignUp: true, // Send verification on sign-up
            autoSignInAfterVerification: false, // No Auto-Login 
            sendVerificationEmail: async ({ user, url }) => {
               const urlObj = new URL(url);
                urlObj.searchParams.set("callbackURL", "/login?verified=true");
                
                await sendVerificationEmail({
                    to: user.email,
                    verificationUrl: urlObj.toString(),
                });
            },
        },
        socialProviders: {
            google: {
                enabled: true,
                clientId: env.GOOGLE_CLIENT_ID!,
                clientSecret: env.GOOGLE_CLIENT_SECRET!,
            },
        },
        plugins: [nextCookies()],
        // Rate Limiting
        rateLimit: {
            enabled: true,
            window: 60, // 60 seconds
            max: 5, // Max 5 requests
        },
    });

    return cachedAuth;
}

/**
 * Get the current authenticated user from the session
 * Returns null if no user is authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const auth = await getAuth();
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return null;
        }

        return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

/**
 * Get the current authenticated user or throw an error
 * Use this when authentication is required
 */
export async function requireAuth(): Promise<AuthUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Authentication required");
    }

    return user;
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Get the auth instance for use in server actions and API routes
 */
export async function getAuthInstance() {
    return await getAuth();
}

/**
 * Get session information
 */
export async function getSession() {
    try {
        const auth = await getAuth();
        return await auth.api.getSession({
            headers: await headers(),
        });
    } catch (error) {
        console.error("Error getting session:", error);
        return null;
    }
}
