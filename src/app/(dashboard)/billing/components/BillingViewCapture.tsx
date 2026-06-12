'use client'

import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

export function BillingViewCapture() {
  const capturedRef = useRef(false)

  const onMount = useCallback((node: HTMLDivElement | null) => {
    if (!node || capturedRef.current) return
    capturedRef.current = true
    capture(EVENTS.billing_page_view)
  }, [])

  return <div ref={onMount} hidden aria-hidden />
}
