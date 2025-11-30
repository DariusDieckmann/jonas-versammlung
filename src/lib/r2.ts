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

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split(".").pop() || "bin";
        const key = `${folder}/${timestamp}_${randomId}.${extension}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Upload to R2
        const result = await env.BUCKET.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
                contentDisposition: "attachment", // Force download, prevent execution
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
        const publicUrl = `https://${(env as CloudflareEnv).CLOUDFLARE_R2_URL}/${key}`;

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
