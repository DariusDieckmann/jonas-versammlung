import { z } from "zod";

export const signInSchema = z.object({
    email: z
        .string()
        .email({ message: "Please enter a valid email address" })
        .min(1, { message: "Email is required" }),
    password: z
        .string()
        .min(1, { message: "Password is required" }),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username should contain minimum 3 character(s)" })
        .max(30, { message: "Username should not exceed 30 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores and hyphens" }),
    email: z
        .string()
        .email({ message: "Please enter a valid email address" })
        .min(1, { message: "Email is required" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export type AuthResponse = {
    success: boolean;
    message: string;
};
