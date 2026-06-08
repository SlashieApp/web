'use client'

import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

import { WorkersBrowseLayout } from './components/WorkersBrowseLayout'

export default function WorkersBrowsePage() {
  const trackedRef = useRef(false)

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.workers_view, {
      source: 'workers_grid',
      is_authenticated: true,
    })
  }, [])

  return (
    <div ref={onMountRef}>
      <WorkersBrowseLayout />
    </div>
  )
}
