"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addOrganizationMember } from "../../shared/organization.action";

const addMemberSchema = z.object({
    email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
    role: z.enum(["owner", "member"]),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
    organizationId: number;
    onSuccess?: () => void;
}

export function AddMemberDialog({
    organizationId,
    onSuccess,
}: AddMemberDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<AddMemberFormData>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: {
            email: "",
            role: "member",
        },
    });

    const onSubmit = (data: AddMemberFormData) => {
        startTransition(async () => {
            try {
                const result = await addOrganizationMember(
                    organizationId,
                    data.email,
                    data.role,
                );

                if (!result.success) {
                    toast.error(
                        result.error ||
                            "Mitglied konnte nicht hinzugefügt werden",
                    );
                    return;
                }

                toast.success("Mitglied erfolgreich hinzugefügt!");
                form.reset();
                setOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                console.error("Error adding member:", error);
                toast.error("Ein unerwarteter Fehler ist aufgetreten");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Mitglied hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mitglied hinzufügen</DialogTitle>
                    <DialogDescription>
                        Füge ein neues Mitglied zur Organisation hinzu. Die
                        Person wird automatisch benachrichtigt, wenn sie
                        registriert ist.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-Mail-Adresse *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="name@beispiel.de"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        E-Mail-Adresse des Benutzers
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rolle *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Rolle auswählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="member">
                                                Mitglied
                                            </SelectItem>
                                            <SelectItem value="owner">
                                                Eigentümer
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Die Rolle des neuen Mitglieds
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending
                                    ? "Wird hinzugefügt..."
                                    : "Hinzufügen"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
