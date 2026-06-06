'use client'

import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import { capture, getPostHog, initPostHogClient } from '@/lib/analytics'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const initializedRef = useRef(false)
  const lastPathRef = useRef<string | null>(null)

  if (!initializedRef.current) {
    initPostHogClient()
    initializedRef.current = true
  }

  if (pathname && pathname !== lastPathRef.current) {
    const previousPath = lastPathRef.current
    lastPathRef.current = pathname
    // Initial load is handled by posthog.init(capture_pageview: true).
    if (previousPath === null) return
    const ph = getPostHog()
    if (ph) {
      ph.capture('$pageview', { route: pathname })
    } else {
      capture('$pageview', { route: pathname })
    }
  }

  return <>{children}</>
}
