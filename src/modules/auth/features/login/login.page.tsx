import { Building2 } from "lucide-react";
import { LoginForm } from "./login-form";
import { Navigation } from "@/components/public/public-navigation";
import { LandingFooter } from "@/components/public/public-footer";

export default function LoginPage() {
    return (
        <>
            <Navigation />
            <div className="bg-gradient-to-b from-blue-50 to-white flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <LoginForm />
                </div>
            </div>
            <LandingFooter />
        </>
    );
}
