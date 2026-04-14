'use client'

import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { useRef } from 'react'

import { initPostHog } from '@/utils/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const initializedRef = useRef(false)
  const lastPathRef = useRef<string | null>(null)
  if (!initializedRef.current) {
    initPostHog()
    initializedRef.current = true
  }
  if (pathname && pathname !== lastPathRef.current) {
    lastPathRef.current = pathname
    posthog.capture('$pageview')
  }

  return <>{children}</>
}
