"use client"

import { useState, useMemo } from "react"
import { MOCK_SEARCH_RESULTS } from "@/constants/mockData"

export const useSearch = () => {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    if (!query.trim()) return []

    return MOCK_SEARCH_RESULTS.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()),
    )
  }, [query])

  const clearSearch = () => setQuery("")

  return {
    query,
    setQuery,
    results,
    clearSearch,
    hasResults: results.length > 0,
  }
}
