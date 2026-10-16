import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'

import { stripLocalePrefix } from '@/i18n/navigation'

import { APP_HOME } from './appRoutes'

/** Max chars accepted from a `/tasks/create?title=` link into the draft title. */
export const TASK_DRAFT_TITLE_MAX = 120

/** Create a new task prefilled from one of the poster's earlier tasks. */
export function repostTaskHref(taskId: string): string {
  return `/tasks/create?repost=${encodeURIComponent(taskId)}`
}

export type MapCentre = { lat: number; lng: number }

/**
 * Carry the `/search` map centre into create (`from=search&lat=&lng=`) so its
 * map opens on the same spot. Existing params (e.g. `title`) are kept.
 */
export function createTaskHrefWithSearchCentre(
  href: string,
  centre: MapCentre | null,
): string {
  if (!centre || !Number.isFinite(centre.lat) || !Number.isFinite(centre.lng)) {
    return href
  }
  const [path, query = ''] = href.split('?')
  const params = new URLSearchParams(query)
  params.set('from', 'search')
  params.set('lat', centre.lat.toFixed(6))
  params.set('lng', centre.lng.toFixed(6))
  return `${path}?${params}`
}

// Live `/search` camera centre, published by the search map on every move.
let searchMapCentre: MapCentre | null = null
const searchMapCentreListeners = new Set<() => void>()

export function publishSearchMapCentre(lat: number, lng: number): void {
  searchMapCentre = { lat, lng }
  for (const listener of searchMapCentreListeners) listener()
}

function subscribeSearchMapCentre(listener: () => void) {
  searchMapCentreListeners.add(listener)
  return () => {
    searchMapCentreListeners.delete(listener)
  }
}

/**
 * Create-task link for app chrome (dock, header). On `/search` it carries the
 * live map centre; everywhere else it is `href` unchanged.
 */
export function useCreateTaskHref(href = '/tasks/create'): string {
  const pathname = usePathname() ?? ''
  const centre = useSyncExternalStore(
    subscribeSearchMapCentre,
    () => searchMapCentre,
    () => null,
  )
  const onSearch = stripLocalePrefix(pathname) === APP_HOME
  return onSearch ? createTaskHrefWithSearchCentre(href, centre) : href
}
