"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import conductRoutes from "../../shared/conduct.route";
import { startMeeting } from "../../shared/meeting.action";

interface StartMeetingButtonProps {
    meetingId: number;
}

export function StartMeetingButton({ meetingId }: StartMeetingButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleStart() {
        setIsLoading(true);
        try {
            const result = await startMeeting(meetingId);
            
            if (result.success) {
                router.push(conductRoutes.leaders(meetingId));
            } else {
                console.error("Failed to start meeting:", result.error);
                toast.error(result.error || "Versammlung konnte nicht gestartet werden");
            }
        } catch (error) {
            console.error("Error starting meeting:", error);
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant="default"
            size="sm"
            onClick={handleStart}
            disabled={isLoading}
        >
            <Play className="mr-2 h-4 w-4" />
            {isLoading ? "Wird gestartet..." : "Starten"}
        </Button>
    );
}
