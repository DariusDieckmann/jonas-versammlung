import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getAllCategories } from "@/modules/todos/features/categories/get-categories.action";
import { TodoForm } from "@/modules/todos/shared/components/todo-form";
import { getUserOrganizations } from "@/modules/organizations/shared/organization.action";
import todosRoutes from "../../todos.route";

export default async function NewTodoPage() {
    const user = await requireAuth();
    
    // Check if user has an organization
    const organizations = await getUserOrganizations();
    if (!organizations.length) {
        redirect("/dashboard/settings/organization");
    }
    
    const organizationId = organizations[0].id;
    const categories = await getAllCategories(organizationId);

    return (
        <>
            <div className="mb-8">
                <Link href={todosRoutes.list}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Todos
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Create New Todo</h1>
                <p className="text-gray-600 mt-1">
                    Add a new task to your todo list
                </p>
            </div>

            <TodoForm user={user} organizationId={organizationId} categories={categories} />
        </>
    );
}
