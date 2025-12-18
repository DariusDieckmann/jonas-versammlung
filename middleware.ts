import { type NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/shared/utils/auth-utils";

export async function middleware(request: NextRequest) {
    try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Session validation timeout")), 5000)
        );

        // Validate session with timeout
        const auth = await getAuth();
        const session = await Promise.race([
            auth.api.getSession({
                headers: request.headers,
            }),
            timeoutPromise,
        ]);

        if (!session) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("from", request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    } catch (error) {
        // If session validation fails or times out, redirect to login
        console.error("Middleware authentication error:", error);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        "/dashboard/:path*", // Protects /dashboard and all sub-routes
    ],
};
