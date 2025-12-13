"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import meetingsRoutes from "../../shared/meetings.route";

export function NewMeetingButton() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    return (
        <Button
            onClick={() => {
                setIsNavigating(true);
                router.push(meetingsRoutes.new);
            }}
            disabled={isNavigating}
        >
            <Plus className="mr-2 h-4 w-4" />
            {isNavigating ? "Lädt..." : "Neue Versammlung"}
        </Button>
    );
}
