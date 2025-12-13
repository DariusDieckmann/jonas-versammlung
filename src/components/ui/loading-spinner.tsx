import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
};

export function LoadingSpinner({
    size = "md",
    text,
    fullScreen = false,
    className,
}: LoadingSpinnerProps) {
    const containerClass = fullScreen
        ? "flex items-center justify-center min-h-screen"
        : "flex items-center justify-center";

    return (
        <div className={cn(containerClass, className)}>
            <div className="flex flex-col items-center gap-4">
                <div
                    className={cn(
                        sizeClasses[size],
                        "border-blue-600 border-t-transparent rounded-full animate-spin",
                    )}
                />
                {text && <p className="text-gray-600 text-sm">{text}</p>}
            </div>
        </div>
    );
}
