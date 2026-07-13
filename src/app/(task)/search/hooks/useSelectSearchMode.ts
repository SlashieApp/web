'use client'

import { useCallback } from 'react'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { useSearchMode } from '../context/SearchModeProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'
import type { SearchMode } from '../helpers/searchQueryParams'

/**
 * Search mode from context plus a change handler that clears the other mode's
 * selection and closes the filter panel (fields are mode-specific).
 */
export function useSelectSearchMode() {
  const { mode, setMode } = useSearchMode()
  const { setSelectedTaskId } = useTaskBrowseData()
  const { setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedWorkerId } = useWorkerSearch()

  const selectMode = useCallback(
    (next: SearchMode) => {
      if (next === mode) return
      setIsFilterOpen(false)
      setSelectedTaskId(null)
      setSelectedWorkerId(null)
      setMode(next)
    },
    [mode, setIsFilterOpen, setMode, setSelectedTaskId, setSelectedWorkerId],
  )

  return { mode, selectMode }
}
