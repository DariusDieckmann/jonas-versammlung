"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/modules/auth/shared/utils/auth-client";
import authRoutes from "@/modules/auth/shared/auth.route";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: ForgotPasswordSchema) {
        setIsLoading(true);
        try {
            await authClient.forgetPassword({
                email: values.email,
                redirectTo: "/reset-password",
            });
            
            setEmailSent(true);
            toast.success("Password reset email sent! Check your inbox.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    }

    if (emailSent) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">📧 Check your email</CardTitle>
                        <CardDescription>
                            We've sent you a password reset link
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                            <p className="font-medium mb-2">✅ Email sent!</p>
                            <p>Please check your inbox and click the password reset link.</p>
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

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Forgot your password?</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="mail@mail.com"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                            <div className="text-center">
                                <Link
                                    href={authRoutes.login}
                                    className="text-sm underline underline-offset-4 text-muted-foreground hover:text-primary"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
