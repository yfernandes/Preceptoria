"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import type { SearchResult } from "@/types"

interface SearchResultsProps {
  results: SearchResult[]
  onResultClick?: (result: SearchResult) => void
}

export const SearchResults = memo<SearchResultsProps>(({ results, onResultClick }) => {
  if (results.length === 0) {
    return <div className="px-3 py-2 text-sm text-gray-500">Nenhum resultado encontrado</div>
  }

  return (
    <div className="py-1">
      {results.map((result, index) => (
        <button
          key={`${result.type}-${result.id}-${index}`}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors"
          onClick={() => onResultClick?.(result)}
        >
          <Badge variant="outline" className="text-xs">
            {result.type}
          </Badge>
          <span className="text-sm text-gray-900 truncate">{result.name}</span>
        </button>
      ))}
    </div>
  )
})

SearchResults.displayName = "SearchResults"
