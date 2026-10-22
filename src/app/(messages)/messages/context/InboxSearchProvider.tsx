'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

import type { InboxFilter } from '../helpers/messagesInbox'

export type InboxSearchValue = {
  searchText: string
  filter: InboxFilter
  setSearchText: (searchText: string) => void
  setFilter: (filter: InboxFilter) => void
}

/** Exported for stories; app code uses the provider and hook. */
export const InboxSearchContext = createContext<InboxSearchValue | null>(null)

/**
 * The inbox's search text and filter (FE-362), in state and not the URL. They
 * live in the `/messages` layout rather than the list: opening a conversation
 * swaps the page, which would reset the list's own state. Leaving Messages
 * resets them.
 */
export function InboxSearchProvider({ children }: { children: ReactNode }) {
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState<InboxFilter>('all')
  const value = useMemo(
    () => ({ searchText, filter, setSearchText, setFilter }),
    [searchText, filter],
  )

  return (
    <InboxSearchContext.Provider value={value}>
      {children}
    </InboxSearchContext.Provider>
  )
}

export function useInboxSearch(): InboxSearchValue {
  const ctx = useContext(InboxSearchContext)
  if (!ctx) {
    throw new Error('useInboxSearch must be used within InboxSearchProvider')
  }
  return ctx
}
