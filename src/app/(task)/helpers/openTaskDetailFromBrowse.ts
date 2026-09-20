import { stripLocalePrefix } from '@/i18n/navigation'

function barePathname(pathname: string): string {
  return stripLocalePrefix(pathname.split('?')[0] || pathname)
}

/** True for `/search` (locale prefix allowed). */
export function isSearchBrowsePath(pathname: string): boolean {
  return barePathname(pathname) === '/search'
}

/** True for `/tasks/[slug]` (not edit or other nested task routes). */
export function isTaskDetailPath(pathname: string): boolean {
  return /^\/tasks\/[^/]+$/.test(barePathname(pathname))
}

/** Task id on public `/tasks/[slug]` (locale prefix allowed). */
export function taskIdFromDetailPath(pathname: string): string | null {
  const match = barePathname(pathname).match(/^\/tasks\/([^/]+)$/)
  return match?.[1] ?? null
}

/**
 * Routes that keep the shared marketplace Mapbox instance mounted in the
 * (task) layout: browse search and the public task-detail page (not edit).
 */
export function isPersistentMarketplaceMapPath(pathname: string): boolean {
  return isSearchBrowsePath(pathname) || isTaskDetailPath(pathname)
}

/** True when task detail was opened from `/search` (`?from=search`). */
export function isTaskDetailFromSearchQuery(search: string): boolean {
  return new URLSearchParams(search).get('from') === 'search'
}

export function taskDetailHrefFromBrowse(
  taskId: string,
  options?: { fromSearch?: boolean; lat?: number; lng?: number },
): string {
  if (!options?.fromSearch) return `/tasks/${taskId}`
  const params = new URLSearchParams({ from: 'search' })
  if (
    options.lat != null &&
    options.lng != null &&
    Number.isFinite(options.lat) &&
    Number.isFinite(options.lng)
  ) {
    params.set('lat', options.lat.toFixed(5))
    params.set('lng', options.lng.toFixed(5))
  }
  return `/tasks/${taskId}?${params}`
}
