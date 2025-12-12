"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import conductRoutes from "../../shared/conduct.route";
import type { Meeting } from "../../shared/schemas/meeting.schema";
import type { MeetingLeader } from "../../shared/schemas/meeting-leader.schema";
import { ConductLayout } from "./conduct-layout";
import { ConductLeadersForm } from "./conduct-leaders-form";

interface ConductLeadersClientProps {
    meeting: Meeting;
    existingLeaders: MeetingLeader[];
}

export function ConductLeadersClient({
    meeting,
    existingLeaders,
}: ConductLeadersClientProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => {
        // Trigger form submit programmatically
        if (formRef.current) {
            const submitEvent = new Event("submit", {
                bubbles: true,
                cancelable: true,
            });
            formRef.current.dispatchEvent(submitEvent);
        }
    };

    const handleSuccess = () => {
        router.push(conductRoutes.participants(meeting.id));
    };

    return (
        <ConductLayout
            meeting={meeting}
            currentStep={1}
            maxWidth="3xl"
            onNext={handleNext}
            nextLabel={isSubmitting ? "Wird gespeichert..." : "Weiter"}
            nextDisabled={isSubmitting}
        >
            <ConductLeadersForm
                meetingId={meeting.id}
                existingLeaders={existingLeaders}
                onSuccess={handleSuccess}
                formRef={formRef}
                onSubmittingChange={setIsSubmitting}
            />
        </ConductLayout>
    );
}
