import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	text?: string;
	className?: string;
}

const sizeClasses = {
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-8 w-8",
};

export function LoadingSpinner({
	size = "md",
	text,
	className = "",
}: LoadingSpinnerProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center space-y-2 ${className}`}
		>
			<Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
			{text && <p className="text-sm text-gray-500">{text}</p>}
		</div>
	);
}
