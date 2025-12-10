import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
    return (
        <div className="bg-gray-50">
            <LoadingSpinner fullScreen text="Lädt..." size="md" />
        </div>
    );
}
