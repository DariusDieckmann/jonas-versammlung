"use server";

import { and, eq } from "drizzle-orm";
import { categories, getDb, organizationMembers } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { type Todo, todos } from "@/modules/todos/shared/schemas/todo.schema";

export default async function getAllTodos(
    organizationId: number,
): Promise<Todo[]> {
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

        const data = await db
            .select({
                id: todos.id,
                title: todos.title,
                description: todos.description,
                completed: todos.completed,
                categoryId: todos.categoryId,
                categoryName: categories.name,
                dueDate: todos.dueDate,
                imageUrl: todos.imageUrl,
                imageAlt: todos.imageAlt,
                status: todos.status,
                priority: todos.priority,
                organizationId: todos.organizationId,
                createdBy: todos.createdBy,
                createdAt: todos.createdAt,
                updatedAt: todos.updatedAt,
            })
            .from(todos)
            .leftJoin(
                categories,
                and(
                    eq(todos.categoryId, categories.id),
                    eq(categories.organizationId, organizationId),
                ),
            )
            .where(eq(todos.organizationId, organizationId))
            .orderBy(todos.createdAt);

        return data;
    } catch (error) {
        console.error("Error fetching todos:", error);
        return [];
    }
}
