"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createOrganization } from "../../shared/organization.action";

const createOrganizationSchema = z.object({
    name: z
        .string()
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must be at most 100 characters"),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters")
        .optional(),
});

type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

export function CreateOrganizationForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<CreateOrganizationFormData>({
        resolver: zodResolver(createOrganizationSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = (data: CreateOrganizationFormData) => {
        startTransition(async () => {
            try {
                const result = await createOrganization(data);

                if (!result.success) {
                    toast.error(result.error || "Failed to create organization");
                    return;
                }

                toast.success("Organization created successfully!");
                router.refresh();
            } catch (error) {
                console.error("Error creating organization:", error);
                toast.error("An unexpected error occurred");
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organization Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="My Organization"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Choose a name for your organization
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Optional description..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Optional description for your organization
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Creating..." : "Create Organization"}
                </Button>
            </form>
        </Form>
    );
}
