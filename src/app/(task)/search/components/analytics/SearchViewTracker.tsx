'use client'

import { useEffect, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

/** Fires `browse_view` once per search-screen mount. */
export function SearchViewTracker() {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.browse_view, { source: 'search_map' })
  }, [])

  return null
}
