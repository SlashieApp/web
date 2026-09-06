'use client'

import { useEffect, useRef } from 'react'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES } from '@/app/(task)/helpers/taskBrowseHelpers'
import { useLocale } from '@/i18n/LocaleProvider'
import { withLocale } from '@/i18n/navigation'

import { useWorkerSearch } from '../context/WorkerSearchProvider'
import { buildWorkersUrl } from '../helpers/workersQueryParams'

/**
 * Mirrors submitted area + worker filters into the URL
 * (history.replaceState — no navigation) so /workers views are shareable.
 */
export function WorkersUrlSync() {
  const locale = useLocale()
  const { referenceLocation, submittedRadiusMiles } = useTaskBrowseData()
  const { submittedWorkerSearchText, submittedVerifiedOnly } = useWorkerSearch()

  const hasCustomCenter = referenceLocation.source !== 'default'
  const hasCustomRadius =
    submittedRadiusMiles !== DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES

  const url = withLocale(
    locale,
    buildWorkersUrl({
      lat: hasCustomCenter ? referenceLocation.lat : undefined,
      lng: hasCustomCenter ? referenceLocation.lng : undefined,
      radiusMiles: hasCustomRadius ? submittedRadiusMiles : undefined,
      searchText: submittedWorkerSearchText || undefined,
      verifiedOnly: submittedVerifiedOnly || undefined,
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
