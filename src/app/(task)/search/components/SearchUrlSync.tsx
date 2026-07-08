'use client'

import { useEffect, useRef } from 'react'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES } from '../../helpers/taskBrowseHelpers'
import { useSearchMode } from '../context/SearchModeProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'
import { buildSearchUrl } from '../helpers/searchQueryParams'

/**
 * Mirrors mode + viewport + submitted filters into the URL query
 * (history.replaceState — no navigation) so any /search view is shareable.
 * The viewport is included once the user has moved off the default center.
 */
export function SearchUrlSync() {
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

  const url = buildSearchUrl({
    mode,
    lat: hasCustomCenter ? referenceLocation.lat : undefined,
    lng: hasCustomCenter ? referenceLocation.lng : undefined,
    radiusMiles: hasCustomRadius ? submittedRadiusMiles : undefined,
    taskSearchText: submittedSearchText || undefined,
    taskCategory: submittedCategory || undefined,
    workerSearchText: submittedWorkerSearchText || undefined,
    workerVerifiedOnly: submittedVerifiedOnly || undefined,
  })

  const lastUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastUrlRef.current === url) return
    lastUrlRef.current = url
    window.history.replaceState(window.history.state, '', url)
  }, [url])

  return null
}
