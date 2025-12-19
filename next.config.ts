import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import("next").NextConfig} */
const nextConfig = {
    // Compiler optimizations
    compiler: {
        // Keep console logs in production for Cloudflare observability
        removeConsole: false,
    },
    
    // Experimental features for better performance
    experimental: {
        // Enable optimized package imports
        optimizePackageImports: [
            "lucide-react",
            "react-hook-form",
            "framer-motion",
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
        ],
        // Enable parallel routes caching
    },
};

if (process.env.NODE_ENV === "development") {
    initOpenNextCloudflareForDev();
}

export default nextConfig;
