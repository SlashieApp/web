import { stripLocalePrefix } from '@/i18n/navigation'
import { APP_HOME, MY_TASKS_HREF } from '@/utils/appRoutes'

function barePathname(pathname: string): string {
  return stripLocalePrefix(pathname.split('?')[0] || pathname)
}

/** True for `/search` (locale prefix allowed). */
export function isSearchBrowsePath(pathname: string): boolean {
  return barePathname(pathname) === '/search'
}

/** `/tasks/[slug]` and its owner preview `/tasks/[slug]/preview`. */
const TASK_DETAIL_PATH = /^\/tasks\/([^/]+)(?:\/preview)?$/

/** True for `/tasks/[slug]` or its preview (not edit or other nested routes). */
export function isTaskDetailPath(pathname: string): boolean {
  return TASK_DETAIL_PATH.test(barePathname(pathname))
}

/** Task id on `/tasks/[slug]` or its preview (locale prefix allowed). */
export function taskIdFromDetailPath(pathname: string): string | null {
  const match = barePathname(pathname).match(TASK_DETAIL_PATH)
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

/** Task detail opened from My Tasks (back returns there, FE-210). */
export function taskDetailHrefFromMyTasks(taskId: string): string {
  return `/tasks/${taskId}?from=tasks`
}

const LAST_SEARCH_KEY = 'slashie.last-search-href'

/** Remember the current search view (bare path + query) for task detail's back. */
export function rememberSearchHref(href: string): void {
  try {
    sessionStorage.setItem(LAST_SEARCH_KEY, href)
  } catch {
    // Storage can be blocked; back then lands on plain /search.
  }
}

export function readRememberedSearchHref(): string | null {
  try {
    return sessionStorage.getItem(LAST_SEARCH_KEY)
  } catch {
    return null
  }
}

/**
 * Where task detail's back goes (FE-210): only ever My Tasks or search.
 * From My Tasks it returns there; from search it returns to the search view
 * the poster left (query and map centre); every other entry (direct link,
 * message, after create, edit or quote) lands on /search.
 */
export function taskDetailBackHref(
  locationSearch: string,
  rememberedSearchHref: string | null,
): string {
  const from = new URLSearchParams(locationSearch).get('from')
  if (from === 'tasks') return MY_TASKS_HREF
  if (
    from === 'search' &&
    rememberedSearchHref &&
    isSearchBrowsePath(rememberedSearchHref)
  ) {
    return rememberedSearchHref
  }
  return APP_HOME
}
