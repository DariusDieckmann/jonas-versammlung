"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
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
import { createOrganization } from "../../shared/organization.action";

const createOrganizationSchema = z.object({
    name: z
        .string()
        .min(2, "Organisationsname muss mindestens 2 Zeichen lang sein")
        .max(100, "Organisationsname darf maximal 100 Zeichen lang sein"),
});

type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

interface CreateOrganizationFormProps {
    onSuccess?: () => void;
}

export function CreateOrganizationForm({
    onSuccess,
}: CreateOrganizationFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<CreateOrganizationFormData>({
        resolver: zodResolver(createOrganizationSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (data: CreateOrganizationFormData) => {
        startTransition(async () => {
            try {
                const result = await createOrganization(data);

                if (!result.success) {
                    toast.error(
                        result.error ||
                            "Organisation konnte nicht erstellt werden",
                    );
                    return;
                }

                toast.success("Organisation erfolgreich erstellt!");
                form.reset();
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                console.error("Error creating organization:", error);
                toast.error("Ein unerwarteter Fehler ist aufgetreten");
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
                            <FormLabel>Organisationsname *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Meine Organisation"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Wähle einen Namen für deine Organisation
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Erstelle..." : "Organisation erstellen"}
                </Button>
            </form>
        </Form>
    );
}
