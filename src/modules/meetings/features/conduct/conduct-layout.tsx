import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import conductRoutes from "../../conduct.route";
import meetingsRoutes from "../../meetings.route";
import type { Meeting } from "../../shared/schemas/meeting.schema";

interface ConductLayoutProps {
    meeting: Meeting;
    currentStep: 1 | 2 | 3 | 4;
    maxWidth?: "3xl" | "5xl" | "7xl";
    onNext?: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    children: React.ReactNode;
}

const steps = [
    { number: 1, label: "Leiter festlegen" },
    { number: 2, label: "Teilnehmer prüfen" },
    { number: 3, label: "Tagesordnung" },
    { number: 4, label: "Zusammenfassung" },
];

export function ConductLayout({
    meeting,
    currentStep,
    maxWidth = "7xl",
    onNext,
    nextLabel = "Weiter",
    nextDisabled = false,
    children,
}: ConductLayoutProps) {
    const maxWidthClass = `max-w-${maxWidth}`;

    // Step navigation
    const getPreviousStepHref = () => {
        if (currentStep === 2) return conductRoutes.leaders(meeting.id);
        if (currentStep === 3) return conductRoutes.participants(meeting.id);
        if (currentStep === 4) return conductRoutes.agendaItems(meeting.id);
        return null;
    };

    const getNextStepHref = () => {
        if (currentStep === 1) return conductRoutes.participants(meeting.id);
        if (currentStep === 2) return conductRoutes.agendaItems(meeting.id);
        if (currentStep === 3) return conductRoutes.summary(meeting.id);
        return null;
    };

    return (
        <div className={`container mx-auto py-8 px-4 ${maxWidthClass}`}>
            {/* Top: Back to Overview */}
            <div className="mb-6">
                <Link href={meetingsRoutes.detail(meeting.id)}>
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
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
                        <div
                            key={step.number}
                            className="flex items-center gap-2"
                        >
                            {index > 0 && (
                                <div className="h-px w-8 bg-gray-300" />
                            )}

                            <div
                                className={`flex items-center gap-2 ${
                                    step.number === currentStep
                                        ? ""
                                        : step.number < currentStep
                                          ? "text-gray-400"
                                          : "text-gray-400"
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                        step.number === currentStep
                                            ? "bg-blue-500 text-white"
                                            : step.number < currentStep
                                              ? "bg-green-500 text-white"
                                              : "bg-gray-200"
                                    }`}
                                >
                                    {step.number < currentStep
                                        ? "✓"
                                        : step.number}
                                </div>
                                <span
                                    className={
                                        step.number === currentStep
                                            ? "font-medium"
                                            : ""
                                    }
                                >
                                    {step.number < currentStep
                                        ? step.label
                                              .replace(
                                                  "festlegen",
                                                  "festgelegt",
                                              )
                                              .replace("prüfen", "geprüft")
                                        : step.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            {children}

            {/* Bottom: Step Navigation */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
                {(() => {
                    const prevHref = getPreviousStepHref();
                    return prevHref ? (
                        <Link href={prevHref}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Zurück
                            </Button>
                        </Link>
                    ) : (
                        <div></div>
                    );
                })()}

                {(() => {
                    if (onNext) {
                        return (
                            <Button onClick={onNext} disabled={nextDisabled}>
                                {nextLabel}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        );
                    }
                    const nextHref = getNextStepHref();
                    return nextHref ? (
                        <Link href={nextHref}>
                            <Button>
                                {nextLabel}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    ) : (
                        <div></div>
                    );
                })()}
            </div>
        </div>
    );
}
