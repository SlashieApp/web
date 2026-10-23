'use client'

import { useCallback } from 'react'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'
import { mapPinTapAction } from './mapPinTapAction'
import { setTaskHandoff } from './taskCardHandoff'
import { toBrowseTaskCard } from './toBrowseTaskCard'
import { useOpenTaskDetailFromBrowse } from './useOpenTaskDetailFromBrowse'

/**
 * Opens the public task detail route for a task picked on the map: the filter
 * panel closes, the card seeds the page's handoff, then the page opens. Used
 * where a pick means "this task" (a row of the same-spot list), and by
 * `useSelectBrowseTaskFromMap` for a tap on the pin that is already selected.
 */
export function useOpenBrowseTaskFromMap() {
  const { setIsFilterOpen } = useTaskBrowseLayout()
  const { filteredSorted, referenceLocation } = useTaskBrowseData()
  const { openTaskDetail } = useOpenTaskDetailFromBrowse()

  return useCallback(
    (id: string) => {
      setIsFilterOpen(false)
      const task = filteredSorted.find((row) => row.id === id)
      if (task) setTaskHandoff(toBrowseTaskCard(task, referenceLocation))
      openTaskDetail(id, 'map')
    },
    [filteredSorted, openTaskDetail, referenceLocation, setIsFilterOpen],
  )
}

/**
 * A tap or click on a standalone map pin (FE-401), the same for touch and
 * mouse. The first one selects the task exactly as picking a list or carousel
 * card does (the pin expands, the map flies to it, the list or carousel
 * follows). A tap on the pin of the task that is already selected opens it.
 * `null` is the bare map: it clears the selection.
 */
export function useSelectBrowseTaskFromMap() {
  const { setIsFilterOpen } = useTaskBrowseLayout()
  const { selectedTaskId, setSelectedTaskId } = useTaskBrowseData()
  const openFromMap = useOpenBrowseTaskFromMap()

  return useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedTaskId(null)
        return
      }
      if (mapPinTapAction(id, selectedTaskId) === 'open') {
        openFromMap(id)
        return
      }
      setIsFilterOpen(false)
      setSelectedTaskId(id)
    },
    [openFromMap, selectedTaskId, setIsFilterOpen, setSelectedTaskId],
  )
}
