'use client'

import { useCallback, useRef } from 'react'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

/** Requests browser geolocation once on mount to seed the browse reference point. */
export function BrowseGeolocationInit() {
  const { initGeolocationOnLoad } = useTaskBrowseData()
  const startedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || startedRef.current) return
      startedRef.current = true
      initGeolocationOnLoad()
    },
    [initGeolocationOnLoad],
  )

  return <div ref={onMount} hidden aria-hidden style={{ display: 'none' }} />
}
