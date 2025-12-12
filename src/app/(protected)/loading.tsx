import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProtectedLoading() {
    return (
        <LoadingSpinner
            text="Lädt..."
            size="md"
            className="min-h-[400px]"
        />
    );
}
