'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  type TaskListVariables,
  type TaskSortChoice,
  buildTaskFilter,
  taskSortToInput,
} from '@/utils/taskListQuery'

/** Sort choices offered on inbox pages (`/requests`, `/quotes`). Distance is browse-only. */
export type InboxSortChoice = Exclude<TaskSortChoice, 'nearest'>

export const INBOX_SORT_OPTIONS: { value: InboxSortChoice; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'scheduled', label: 'Scheduled date' },
  { value: 'title', label: 'Title (A–Z)' },
]

export type TaskInboxFiltersState = {
  /** Draft search text (commit via {@link commitSearch}). */
  searchDraft: string
  setSearchDraft: (value: string) => void
  /** Pushes {@link searchDraft} into the active query variables. */
  commitSearch: () => void
  category: string
  setCategory: (value: string) => void
  sort: InboxSortChoice
  setSort: (value: InboxSortChoice) => void
  createdAfter: string
  setCreatedAfter: (value: string) => void
  createdBefore: string
  setCreatedBefore: (value: string) => void
  /** Resets every field to its default. */
  reset: () => void
  /** True when any filter differs from the default. */
  isActive: boolean
  /** GraphQL `{ filter, sort }` variables derived from the committed state. */
  variables: TaskListVariables
}

const DEFAULT_SORT: InboxSortChoice = 'newest'

export function useTaskInboxFilters(): TaskInboxFiltersState {
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<InboxSortChoice>(DEFAULT_SORT)
  const [createdAfter, setCreatedAfter] = useState('')
  const [createdBefore, setCreatedBefore] = useState('')

  const commitSearch = useCallback(() => {
    setSearch(searchDraft.trim())
  }, [searchDraft])

  const reset = useCallback(() => {
    setSearchDraft('')
    setSearch('')
    setCategory('')
    setSort(DEFAULT_SORT)
    setCreatedAfter('')
    setCreatedBefore('')
  }, [])

  const variables = useMemo<TaskListVariables>(
    () => ({
      filter: buildTaskFilter({
        search,
        category,
        createdAfter,
        createdBefore,
      }),
      sort: taskSortToInput(sort),
    }),
    [search, category, createdAfter, createdBefore, sort],
  )

  const isActive =
    search.length > 0 ||
    category.length > 0 ||
    createdAfter.length > 0 ||
    createdBefore.length > 0 ||
    sort !== DEFAULT_SORT

  return {
    searchDraft,
    setSearchDraft,
    commitSearch,
    category,
    setCategory,
    sort,
    setSort,
    createdAfter,
    setCreatedAfter,
    createdBefore,
    setCreatedBefore,
    reset,
    isActive,
    variables,
  }
}
