import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import authRoutes from "@/modules/auth/shared/auth.route";

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">📧 Check your email</CardTitle>
                    <CardDescription>
                        We've sent you a verification link
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                        <p className="font-medium mb-2">✅ Registration successful!</p>
                        <p>Please check your inbox and click the verification link to activate your account and sign in.</p>
                    </div>
                    
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Didn't receive the email?</p>
                        <ul className="list-disc list-inside space-y-1.5">
                            <li>Check your <strong>spam/junk folder</strong></li>
                            <li>Make sure you entered the correct email address</li>
                            <li>Wait a few minutes - emails can take time to arrive</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-center text-muted-foreground mb-3">
                            After clicking the verification link, you'll be automatically signed in.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={authRoutes.login}>
                                Back to Login
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
