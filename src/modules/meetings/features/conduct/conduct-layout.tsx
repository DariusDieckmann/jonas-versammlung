import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import meetingsRoutes from "../../meetings.route";
import type { Meeting } from "../../shared/schemas/meeting.schema";

interface ConductLayoutProps {
    meeting: Meeting;
    currentStep: 1 | 2 | 3;
    maxWidth?: "3xl" | "5xl" | "7xl";
    children: React.ReactNode;
}

const steps = [
    { number: 1, label: "Leiter festlegen" },
    { number: 2, label: "Teilnehmer prüfen" },
    { number: 3, label: "Tagesordnung" },
];

export function ConductLayout({ meeting, currentStep, maxWidth = "7xl", children }: ConductLayoutProps) {
    const maxWidthClass = `max-w-${maxWidth}`;
    
    return (
        <div className={`container mx-auto py-8 px-4 ${maxWidthClass}`}>
            {/* Back Button */}
            <div className="mb-6">
                <Link href={meetingsRoutes.detail(meeting.id)}>
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Versammlung
                    </Button>
                </Link>
            </div>

            {/* Header with Progress */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Versammlung durchführen</h1>
                <p className="text-gray-600 mt-1">{meeting.title}</p>
                
                {/* Progress Bar */}
                <div className="mt-4 flex items-center gap-2">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center gap-2">
                            {index > 0 && <div className="h-px w-8 bg-gray-300" />}
                            
                            <div className={`flex items-center gap-2 ${
                                step.number === currentStep 
                                    ? "" 
                                    : step.number < currentStep 
                                        ? "text-gray-400" 
                                        : "text-gray-400"
                            }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                    step.number === currentStep
                                        ? "bg-blue-500 text-white"
                                        : step.number < currentStep
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200"
                                }`}>
                                    {step.number < currentStep ? "✓" : step.number}
                                </div>
                                <span className={step.number === currentStep ? "font-medium" : ""}>
                                    {step.number < currentStep 
                                        ? step.label.replace("festlegen", "festgelegt").replace("prüfen", "geprüft")
                                        : step.label
                                    }
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
