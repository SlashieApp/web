'use client'

import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

import { MyRequestsLayout } from './components/layout/MyRequestsLayout'
import { MyRequestsProvider } from './context/MyRequestsProvider'

export default function MyRequestsPage() {
  const trackedRef = useRef(false)

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.requests_view)
  }, [])

  return (
    <div ref={onMountRef}>
      <MyRequestsProvider>
        <MyRequestsLayout />
      </MyRequestsProvider>
    </div>
  )
}
