'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useMarketplaceMapDispatch } from '@/app/(task)/context/MarketplaceMapSession'
import {
  isSearchBrowsePath,
  readRememberedSearchHref,
  taskDetailBackHref,
} from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { getAuthToken } from '@/utils/auth'
import { backFallbackHref } from '@/utils/goBack'

/**
 * Back for task detail, the page header's back button. It only ever goes to
 * My Tasks or search (FE-210), never browser history; a visitor with nothing
 * to say where they came from goes to the home page.
 */
export function useTaskBack() {
  const router = useRouter()
  const localize = useLocalizedHref()
  const mapSession = useMarketplaceMapDispatch()

  return useCallback(() => {
    const href = taskDetailBackHref(
      window.location.search,
      readRememberedSearchHref(),
      backFallbackHref(Boolean(getAuthToken())),
    )
    if (isSearchBrowsePath(href)) mapSession?.prepareBrowse()
    router.push(localize(href))
  }, [localize, mapSession, router])
}
