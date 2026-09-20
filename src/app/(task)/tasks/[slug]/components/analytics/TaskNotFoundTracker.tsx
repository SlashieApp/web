'use client'

import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

export function TaskNotFoundTracker() {
  const trackedRef = useRef(false)

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.task_not_found_view)
  }, [])

  return <div ref={onMountRef} hidden aria-hidden />
}
