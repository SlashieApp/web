'use client'

import { createContext, useContext, useMemo, useState } from 'react'

import type { SearchMode } from '../helpers/searchQueryParams'

type SearchModeContextValue = {
  mode: SearchMode
  setMode: (mode: SearchMode) => void
}

const SearchModeContext = createContext<SearchModeContextValue | null>(null)

/**
 * What the unified /search surface is searching for: tasks or workers.
 * State-only — URL reflection is handled by `SearchUrlSync`, and mode-switch
 * side effects (clearing selection, closing filters) by `useSelectSearchMode`.
 */
export function SearchModeProvider({
  children,
  initialMode,
}: {
  children: React.ReactNode
  initialMode: SearchMode
}) {
  const [mode, setMode] = useState<SearchMode>(initialMode)
  const value = useMemo(() => ({ mode, setMode }), [mode])
  return (
    <SearchModeContext.Provider value={value}>
      {children}
    </SearchModeContext.Provider>
  )
}

export function useSearchMode(): SearchModeContextValue {
  const ctx = useContext(SearchModeContext)
  if (!ctx) {
    throw new Error('useSearchMode must be used within SearchModeProvider')
  }
  return ctx
}
