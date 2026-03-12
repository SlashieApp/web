'use client'

import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { useEffect } from 'react'

import { initPostHog } from '@/utils/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview')
    }
  }, [pathname])

  return <>{children}</>
}
