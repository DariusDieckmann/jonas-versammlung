import { getCloudflareContext } from "@opennextjs/cloudflare";
import { validateFile } from "./file-validation";

export interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

export async function uploadToR2(
    file: File,
    folder: string = "uploads",
): Promise<UploadResult> {
    try {
        // Validate file before upload
        const validation = validateFile(file);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }

        const { env } = await getCloudflareContext();

        // Generate unique filename with cryptographically secure random ID
        const timestamp = Date.now();
        const randomBytes = new Uint8Array(12);
        crypto.getRandomValues(randomBytes);
        const randomId = Array.from(randomBytes)
            .map((byte) => byte.toString(36).padStart(2, "0"))
            .join("")
            .substring(0, 15);
        const extension = file.name.split(".").pop() || "bin";
        const key = `${folder}/${timestamp}_${randomId}.${extension}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Sanitize filename for Content-Disposition header to prevent header injection
        // Remove/replace characters that could break HTTP headers: control chars, quotes, backslashes, semicolons
        const sanitizedFileName = file.name
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/[\\]/g, '') // Remove backslashes
            .replace(/["]/g, "'") // Replace double quotes with single quotes
            .replace(/[;]/g, ','); // Replace semicolons with commas

        // Use RFC 5987 encoding for better international filename support
        const encodedFileName = encodeURIComponent(file.name);

        // Upload to R2
        const result = await env.BUCKET.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
                // Set filename using both ASCII fallback and UTF-8 encoded filename
                contentDisposition: `attachment; filename="${sanitizedFileName}"; filename*=UTF-8''${encodedFileName}`,
                cacheControl: "public, max-age=31536000", // 1 year
            },
            customMetadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
                size: file.size.toString(),
            },
        });

        if (!result) {
            return {
                success: false,
                error: "Upload failed",
            };
        }

        // Return public URL of R2 (should be using custom domain)
        const publicUrl = `${(env as CloudflareEnv).CLOUDFLARE_R2_URL}/${key}`;

        return {
            success: true,
            url: publicUrl,
            key: key,
        };
    } catch (error) {
        console.error("R2 upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
}

export async function getFromR2(key: string): Promise<R2Object | null> {
    try {
        const { env } = await getCloudflareContext();
        return env.BUCKET.get(key);
    } catch (error) {
        console.error("Error getting data from R2", error);
        return null;
    }
}

export async function deleteFromR2(key: string): Promise<boolean> {
    try {
        const { env } = await getCloudflareContext();
        await env.BUCKET.delete(key);
        return true;
    } catch (error) {
        console.error("Error deleting file from R2:", error);
        return false;
    }
}

export async function listR2Files() {}
