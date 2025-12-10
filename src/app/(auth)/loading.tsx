import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthLoading() {
    return (
        <div className="bg-gradient-to-b from-blue-50 to-white">
            <LoadingSpinner
                fullScreen
                text="Anmeldung wird geladen..."
                size="md"
            />
        </div>
    );
}
