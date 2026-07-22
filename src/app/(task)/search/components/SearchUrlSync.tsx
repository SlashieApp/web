'use client'

import { useEffect, useRef } from 'react'

import { useLocale } from '@/i18n/LocaleProvider'
import { withLocale } from '@/i18n/navigation'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES } from '../../helpers/taskBrowseHelpers'
import { useSearchMode } from '../context/SearchModeProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'
import { buildSearchUrl } from '../helpers/searchQueryParams'

/**
 * Mirrors mode + viewport + submitted filters into the URL query
 * (history.replaceState — no navigation) so any /search view is shareable.
 * Keeps the active locale prefix so the locale proxy does not bounce `/search` → `/en/search`.
 */
export function SearchUrlSync() {
  const locale = useLocale()
  const { mode } = useSearchMode()
  const {
    referenceLocation,
    submittedRadiusMiles,
    submittedCategory,
    submittedSearchText,
  } = useTaskBrowseData()
  const { submittedWorkerSearchText, submittedVerifiedOnly } = useWorkerSearch()

  const hasCustomCenter = referenceLocation.source !== 'default'
  const hasCustomRadius =
    submittedRadiusMiles !== DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES

  const url = withLocale(
    locale,
    buildSearchUrl({
      mode,
      lat: hasCustomCenter ? referenceLocation.lat : undefined,
      lng: hasCustomCenter ? referenceLocation.lng : undefined,
      radiusMiles: hasCustomRadius ? submittedRadiusMiles : undefined,
      taskSearchText: submittedSearchText || undefined,
      taskCategory: submittedCategory || undefined,
      workerSearchText: submittedWorkerSearchText || undefined,
      workerVerifiedOnly: submittedVerifiedOnly || undefined,
    }),
  )

  const lastUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastUrlRef.current === url) return
    lastUrlRef.current = url
    window.history.replaceState(window.history.state, '', url)
  }, [url])

  return null
}
