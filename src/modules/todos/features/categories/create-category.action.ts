"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, organizationMembers } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import {
    type Category,
    categories,
    insertCategorySchema,
} from "@/modules/todos/shared/schemas/category.schema";
import todosRoutes from "../../todos.route";

export async function createCategory(
    data: unknown,
    organizationId: number,
): Promise<Category> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Verify user is a member of the organization
        const membership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, user.id),
                ),
            )
            .limit(1);

        if (!membership.length) {
            throw new Error("You are not a member of this organization");
        }

        const validatedData = insertCategorySchema.parse({
            ...(data as object),
            organizationId,
        });

        const result = await db
            .insert(categories)
            .values({
                ...validatedData,
                organizationId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .returning();

        if (!result[0]) {
            throw new Error("Failed to create category");
        }

        // Revalidate pages that might show categories
        revalidatePath(todosRoutes.list);
        revalidatePath(todosRoutes.new);

        return result[0];
    } catch (error) {
        console.error("Error creating category:", error);

        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to create category",
        );
    }
}
