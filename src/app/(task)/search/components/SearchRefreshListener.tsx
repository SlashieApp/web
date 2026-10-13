'use client'

import { useCallback } from 'react'

import { onSearchRefresh } from '@/utils/searchRefresh'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'

/** Header logo taps on /search refetch the results (see `searchRefresh`). */
export function SearchRefreshListener() {
  const { retryTasks } = useTaskBrowseData()
  const subscribe = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) return
      return onSearchRefresh(retryTasks)
    },
    [retryTasks],
  )
  return <span ref={subscribe} hidden />
}
