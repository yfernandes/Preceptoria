"use client";

import { memo } from "react";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export const SearchInput = memo<SearchInputProps>(
	({ value, onChange, placeholder = "Buscar...", className = "" }) => {
		return (
			<div className={`relative ${className}`}>
				<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
				<Input
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="h-9 pl-10"
				/>
			</div>
		);
	}
);

SearchInput.displayName = "SearchInput";
