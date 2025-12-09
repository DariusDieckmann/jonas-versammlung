"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import authRoutes from "@/modules/auth/shared/auth.route";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check interval: 5 minutes
const CHECK_INTERVAL = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const lastCheckRef = useRef<number>(Date.now());

    const fetchSession = async (skipLoading = false) => {
        try {
            if (!skipLoading) {
                setLoading(true);
            }

            const res = await fetch(authRoutes.getSession, {
                credentials: "include",
            });

            if (res.ok) {
                const data = (await res.json()) as { user?: User };
                if (data?.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            lastCheckRef.current = Date.now();
        } catch (error) {
            console.error("Error fetching session:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // 1. Initial check on mount
    useEffect(() => {
        fetchSession();
    }, []);

    // 2. Periodic check every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSession(true); // Skip loading state for background checks
        }, CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    // 3. Check when user returns to the tab/window
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                const timeSinceLastCheck = Date.now() - lastCheckRef.current;
                
                // Check if last check was more than 1 minute ago
                if (timeSinceLastCheck > 60000) {
                    fetchSession(true);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
    }, []);

    const refreshAuth = async () => {
        await fetchSession();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
