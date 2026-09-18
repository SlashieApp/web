import { stripLocalePrefix } from '@/i18n/navigation'

function barePathname(pathname: string): string {
  return stripLocalePrefix(pathname.split('?')[0] || pathname)
}

/** True for `/search` (locale prefix allowed). */
export function isSearchBrowsePath(pathname: string): boolean {
  return barePathname(pathname) === '/search'
}

/**
 * Routes that keep the shared marketplace Mapbox instance mounted in the
 * (task) layout: browse search and the public task-detail page (not edit).
 */
export function isPersistentMarketplaceMapPath(pathname: string): boolean {
  const path = barePathname(pathname)
  if (path === '/search') return true
  return /^\/tasks\/[^/]+$/.test(path)
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
