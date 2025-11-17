/**
 * Email Service
 * Handles all email sending logic using Cloudflare MailChannels
 */

/**
 * Send email using Cloudflare MailChannels
 * No API keys required - built into Cloudflare Workers!
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

    // Cloudflare MailChannels API (kostenlos für Cloudflare Workers!)
    try {
        const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: to }],
                    },
                ],
                from: {
                    email: "noreply@triple-d.ninja",
                    name: "Jonas Versammlung",
                },
                subject,
                content: [
                    {
                        type: "text/html",
                        value: html,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to send email: ${response.status} ${errorText}`);
        }

        console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        throw error;
    }
}
