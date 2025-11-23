import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";
import { getUserOrganizations } from "../../shared/organization.action";
import { CreateOrganizationForm } from "./create-organization-form";
import { LeaveOrganizationButton } from "./leave-organization-button";

export default async function OrganizationSettingsPage() {
    const user = await requireAuth();
    const organizations = await getUserOrganizations();

    // User has no organization yet
    if (organizations.length === 0) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <div className="mb-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Organization Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Create your organization to get started
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Organization</CardTitle>
                        <CardDescription>
                            You need an organization to manage todos and collaborate with others.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateOrganizationForm />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User already has an organization (only one allowed)
    const organization = organizations[0];

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Organization Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your organization
                </p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Organization</CardTitle>
                        <CardDescription>
                            You are a member of the following organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">{organization.name}</h3>
                            {organization.description && (
                                <p className="text-gray-600 mt-1">{organization.description}</p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div>
                                <span className="font-medium">{organization.memberCount}</span> member{organization.memberCount !== 1 ? 's' : ''}
                            </div>
                            <div>
                                Created {new Date(organization.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>
                            Leave this organization. This action cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LeaveOrganizationButton 
                            organizationId={organization.id}
                            organizationName={organization.name}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
