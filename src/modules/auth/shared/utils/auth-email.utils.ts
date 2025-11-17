/**
 * Auth Email Utilities
 * Auth-specific email templates and functions
 */

import { sendEmail } from "@/services/email.service";

/**
 * Send verification email
 */
export async function sendVerificationEmail({
    to,
    verificationUrl,
}: {
    to: string;
    verificationUrl: string;
}) {
    return sendEmail({
        to,
        subject: "Verify your email address",
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
    to,
    resetUrl,
}: {
    to: string;
    resetUrl: string;
}) {
    return sendEmail({
        to,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
}
