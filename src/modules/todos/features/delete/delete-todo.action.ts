"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, organizationMembers } from "@/db";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { todos } from "@/modules/todos/shared/schemas/todo.schema";
import todosRoutes from "../../todos.route";

export async function deleteTodoAction(todoId: number) {
    try {
        const user = await requireAuth();
        const db = await getDb();

        // Get the todo first to find its organization
        const existingTodo = await db
            .select()
            .from(todos)
            .where(eq(todos.id, todoId))
            .limit(1);

        if (!existingTodo.length) {
            return {
                success: false,
                error: "Todo not found",
            };
        }

        // Verify user is a member of the organization
        const membership = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(
                        organizationMembers.organizationId,
                        existingTodo[0].organizationId,
                    ),
                    eq(organizationMembers.userId, user.id),
                ),
            )
            .limit(1);

        if (!membership.length) {
            return {
                success: false,
                error: "You are not a member of this organization",
            };
        }

        // Delete the todo
        await db.delete(todos).where(eq(todos.id, todoId));

        revalidatePath(todosRoutes.list);

        return {
            success: true,
            message: "Todo deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting todo:", error);

        if (
            error instanceof Error &&
            error.message === "Authentication required"
        ) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete todo",
        };
    }
}
