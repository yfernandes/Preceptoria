"use client";

import { memo } from "react";
import { Badge } from "../../components/ui/badge";
import type { SearchResult } from "../../types";

interface SearchResultsProps {
	results: SearchResult[];
	onResultClick?: (result: SearchResult) => void;
}

export const SearchResults = memo<SearchResultsProps>(
	({ results, onResultClick }) => {
		if (results.length === 0) {
			return (
				<div className="px-3 py-2 text-sm text-gray-500">
					Nenhum resultado encontrado
				</div>
			);
		}

		return (
			<div className="py-1">
				{results.map((result, index) => (
					<button
						key={`${result.type}-${result.id}-${index}`}
						className="flex w-full items-center space-x-2 px-3 py-2 text-left transition-colors hover:bg-gray-50"
						onClick={() => onResultClick?.(result)}
					>
						<Badge variant="outline" className="text-xs">
							{result.type}
						</Badge>
						<span className="truncate text-sm text-gray-900">
							{result.name}
						</span>
					</button>
				))}
			</div>
		);
	}
);

SearchResults.displayName = "SearchResults";
