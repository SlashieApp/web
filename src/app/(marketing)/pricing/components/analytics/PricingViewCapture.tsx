'use client'

import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'
import { getAuthToken } from '@/utils/auth'

/** Fires pricing_view once on mount. */
export function PricingViewCapture() {
  const capturedRef = useRef(false)

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || capturedRef.current) return
    capturedRef.current = true
    capture(EVENTS.pricing_view, {
      is_authenticated: Boolean(getAuthToken()),
    })
  }, [])

  return <div ref={onMountRef} hidden aria-hidden />
}
