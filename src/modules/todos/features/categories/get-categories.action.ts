"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
    type Category,
    categories,
} from "@/modules/todos/shared/schemas/category.schema";

export async function getAllCategories(
    organizationId: number,
): Promise<Category[]> {
    try {
        const db = await getDb();
        return await db
            .select()
            .from(categories)
            .where(eq(categories.organizationId, organizationId))
            .orderBy(categories.createdAt);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
