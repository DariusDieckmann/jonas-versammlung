"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import meetingsRoutes from "../../shared/meetings.route";

export function BackToMeetingsButton() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    return (
        <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
                setIsNavigating(true);
                router.push(meetingsRoutes.list);
            }}
            disabled={isNavigating}
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isNavigating ? "Lädt..." : "Zurück zur Übersicht"}
        </Button>
    );
}
