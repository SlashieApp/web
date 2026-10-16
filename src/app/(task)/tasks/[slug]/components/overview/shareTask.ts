'use client'

import { useI11n } from '@/i18n/useI11n'
import { useCallback } from 'react'
import bag from '../../i11n.json'

import { showAppToast } from '@/utils/appToast'

/** Share the current task via the Web Share API, falling back to clipboard copy. */
/** Shares `url()` (default: this page) with the share sheet, or copies it. */
export function useShareTask(title: string, shareUrl?: () => string) {
  const t = useI11n(bag)
  return useCallback(async () => {
    const url = shareUrl
      ? shareUrl()
      : typeof window !== 'undefined'
        ? window.location.href
        : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      showAppToast({ title: t.actions.linkCopied, type: 'success' })
    } catch {
      // user dismissed the share sheet — no-op
    }
  }, [shareUrl, t.actions.linkCopied, title])
}
