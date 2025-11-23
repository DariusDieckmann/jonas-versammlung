import { Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function Dashboard() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Willkommen
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Eine Anwendung für Eigentümerversammlungen
                </p>
            </div>

            <div className="grid md:grid-cols-1 gap-8 max-w-md mx-auto">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building2 className="mr-2 h-5 w-5" />
                            Organisation
                        </CardTitle>
                        <CardDescription>
                            Verwalte deine Organisation und Mitglieder
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/settings/organization">
                            <Button className="w-full">
                                Zur Organisation
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
