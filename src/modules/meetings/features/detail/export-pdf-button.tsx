"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import meetingsRoutes from "../../shared/meetings.route";

interface ExportPdfButtonProps {
    meetingId: number;
    variant?: "default" | "outline";
    label?: string;
}

export function ExportPdfButton({
    meetingId,
    variant = "default",
    label = "Als PDF exportieren",
}: ExportPdfButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Trigger download
            window.location.href = meetingsRoutes.exportPdf(meetingId);
        } finally {
            // Reset loading state after a short delay
            setTimeout(() => {
                setIsExporting(false);
            }, 1000);
        }
    };

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
        >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exportiere..." : label}
        </Button>
    );
}
