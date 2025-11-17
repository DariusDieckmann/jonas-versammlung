"use server";

import { sendEmail } from "@/services/email.service";

export async function sendTestEmail() {
    try {
        await sendEmail({
            to: "dari.darox@gmail.com",
            subject: "Test Email from Jonas Versammlung",
            html: `
                <h1>Test Email</h1>
                <p>This is a test email from your Jonas Versammlung app.</p>
                <p>If you receive this, email sending is working correctly! ✅</p>
                <p>Sent at: ${new Date().toLocaleString()}</p>
            `,
        });

        return {
            success: true,
            message: "Test email sent successfully!",
        };
    } catch (error) {
        console.error("Failed to send test email:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to send test email",
        };
    }
}
