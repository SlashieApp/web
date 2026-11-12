'use client'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { useCallback } from 'react'
import bag from '../../i11n.json'

import { showAppToast } from '@/utils/appToast'

import { taskShareUrl } from '../../helpers/taskShareUrl'

/**
 * Shares task `taskId` with the share sheet, or copies its link
 * (`taskShareUrl`). Does nothing without an id.
 */
export function useShareTask(title: string, taskId: string | null | undefined) {
  const t = useI11n(bag)
  const localize = useLocalizedHref()
  return useCallback(async () => {
    if (!taskId || typeof window === 'undefined') return
    const url = taskShareUrl(taskId, localize, window.location.origin)
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
  }, [localize, t.actions.linkCopied, taskId, title])
}
