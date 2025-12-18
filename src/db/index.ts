import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Cache the DB instance per request context
let cachedDb: ReturnType<typeof drizzle> | null = null;
let cachedEnv: any = null;

export async function getDb() {
    const { env } = await getCloudflareContext();

    // Return cached DB if the env hasn't changed (same request context)
    if (cachedDb && cachedEnv === env) {
        return cachedDb;
    }

    // !starterconf - update this to match your D1 database binding name
    // change "next_cf_app" to your D1 database binding name on `wrangler.jsonc`
    cachedDb = drizzle(env.DB, { schema });
    cachedEnv = env;

    return cachedDb;
}

export * from "./schema";
