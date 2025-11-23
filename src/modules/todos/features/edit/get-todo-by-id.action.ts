"use server";

import { and, eq } from "drizzle-orm";
import { categories, getDb, organizationMembers } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { type Todo, todos } from "@/modules/todos/shared/schemas/todo.schema";

export async function getTodoById(id: number): Promise<Todo | null> {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // First get the todo to find its organization
        const todoResult = await db
            .select()
            .from(todos)
            .where(eq(todos.id, id))
            .limit(1);

        if (!todoResult.length) {
            return null;
        }

        const todo = todoResult[0];

        // Verify user is a member of the organization
        const membership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, todo.organizationId),
                    eq(organizationMembers.userId, user.id),
                ),
            )
            .limit(1);

        if (!membership.length) {
            return null;
        }

        // Get todo with category info
        const result = await db
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
                    eq(categories.organizationId, todo.organizationId),
                ),
            )
            .where(eq(todos.id, id))
            .limit(1);

        return result[0] || null;
    } catch (error) {
        console.error("Error fetching todo by id:", error);
        return null;
    }
}
