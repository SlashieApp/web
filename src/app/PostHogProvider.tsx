'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import {
  capture,
  getPostHog,
  initPostHogClient,
  onCookieConsentChange,
} from '@/utils/analytics'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const initializedRef = useRef(false)
  const lastPathRef = useRef<string | null>(null)

  if (!initializedRef.current) {
    // No-op until the visitor has accepted analytics cookies (PECR gate
    // lives inside initPostHogClient).
    initPostHogClient()
    initializedRef.current = true
  }

  // If consent is granted after load (banner "Accept all"), start PostHog
  // immediately; queued pre-decision events flush inside init.
  useEffect(
    () =>
      onCookieConsentChange((value) => {
        if (value === 'accepted') initPostHogClient()
      }),
    [],
  )

  if (pathname && pathname !== lastPathRef.current) {
    const previousPath = lastPathRef.current
    lastPathRef.current = pathname
    // Initial load is handled by posthog.init(capture_pageview: true).
    if (previousPath !== null) {
      const ph = getPostHog()
      if (ph) {
        ph.capture('$pageview', { route: pathname })
      } else {
        capture('$pageview', { route: pathname })
      }
    }
  }

  return <>{children}</>
}
