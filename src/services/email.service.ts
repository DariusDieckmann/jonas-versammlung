/**
 * Email Service
 * Handles all email sending logic using Resend
 * Sign up at: https://resend.com (100 emails/day free)
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Send email using Resend API
 */
export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    // Development mode - Log to console
    if (process.env.NODE_ENV === "development") {
        console.log("📧 Email (Development Mode):");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("HTML:", html);
        return;
    }

    try {
        const { env } = await getCloudflareContext();

        if (!env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not configured");
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Eigentümerversammlungen <noreply@send.triple-d.ninja>",
                to: [to],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to send email: ${response.status} ${errorText}`,
            );
        }

        const data = await response.json();
        console.log(`✅ Email sent to ${to}: ${subject}`, data);
        return data;
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        throw error;
    }
}
