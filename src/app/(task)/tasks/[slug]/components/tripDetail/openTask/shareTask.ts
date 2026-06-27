'use client'

import { useCallback } from 'react'

import { showAppToast } from '@/utils/appToast'

/** Share the current task via the Web Share API, falling back to clipboard copy. */
export function useShareTask(title: string) {
  return useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      showAppToast({ title: 'Link copied', type: 'success' })
    } catch {
      // user dismissed the share sheet — no-op
    }
  }, [title])
}
