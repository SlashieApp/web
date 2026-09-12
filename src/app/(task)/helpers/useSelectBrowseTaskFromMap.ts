'use client'

import { useCallback } from 'react'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'
import { setTaskHandoff } from './taskCardHandoff'
import { toBrowseTaskCard } from './toBrowseTaskCard'
import { useOpenTaskDetailFromBrowse } from './useOpenTaskDetailFromBrowse'

/** Map pin click: highlight is not enough — open the public task detail route. */
export function useSelectBrowseTaskFromMap() {
  const { setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedTaskId, filteredSorted, referenceLocation } =
    useTaskBrowseData()
  const { openTaskDetail } = useOpenTaskDetailFromBrowse()

  return useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedTaskId(null)
        return
      }
      setIsFilterOpen(false)
      const task = filteredSorted.find((row) => row.id === id)
      if (task) setTaskHandoff(toBrowseTaskCard(task, referenceLocation))
      openTaskDetail(id, 'map')
    },
    [
      filteredSorted,
      openTaskDetail,
      referenceLocation,
      setIsFilterOpen,
      setSelectedTaskId,
    ],
  )
}
