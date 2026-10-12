'use client'

import { useEffect, useRef } from 'react'

import { useLocale } from '@/i18n/LocaleProvider'
import { withLocale } from '@/i18n/navigation'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { buildSearchUrl } from '../helpers/searchQueryParams'

/**
 * Mirrors the search centre and search text into the URL query
 * (history.replaceState — no navigation) so any /search view is shareable.
 * A worker's saved area (`preferred`) is personal and stays out of the URL.
 */
export function SearchUrlSync() {
  const locale = useLocale()
  const { referenceLocation, searchText } = useTaskBrowseData()

  const hasCustomCenter =
    referenceLocation.source !== 'default' &&
    referenceLocation.source !== 'preferred'

  const url = withLocale(
    locale,
    buildSearchUrl({
      lat: hasCustomCenter ? referenceLocation.lat : undefined,
      lng: hasCustomCenter ? referenceLocation.lng : undefined,
      taskSearchText: searchText || undefined,
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
