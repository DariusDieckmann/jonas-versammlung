import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get the application's base URL based on the environment
 * @returns The base URL without trailing slash
 */
export async function getAppUrl(): Promise<string> {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
    }

    const { env } = await getCloudflareContext();

    if (env.NEXTJS_ENV === "preview") {
        return "https://jonas-versammlung-app-preview.dari-darox.workers.dev";
    }

    return "https://triple-d.ninja";
}
