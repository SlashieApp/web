'use client'

import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/lib/analytics'

import { WorkerQuotesLayout } from './components/WorkerQuotesLayout'
import { WorkerQuotesProvider } from './context/WorkerQuotesProvider'

export default function MyQuotesPage() {
  const trackedRef = useRef(false)

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.jobs_view)
  }, [])

  return (
    <div ref={onMountRef}>
      <WorkerQuotesProvider>
        <WorkerQuotesLayout />
      </WorkerQuotesProvider>
    </div>
  )
}
