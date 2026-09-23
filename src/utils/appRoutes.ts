import { stripLocalePrefix } from '@/i18n/navigation'

/** Signed-in app home — unified map-first search (tasks + workers). */
export const APP_HOME = '/search' as const

/** My Tasks hub (hosted + quoted). Exact path — not `/tasks/:slug`. */
export const MY_TASKS_HREF = '/tasks' as const

/**
 * Primary nav active state. `/tasks` is exact so task detail and create
 * do not highlight My tasks. Search matches the browse path only.
 */
export function isPrimaryNavHrefActive(
  pathname: string,
  href: string,
): boolean {
  const bare = stripLocalePrefix(pathname.split('?')[0] || pathname || '/')
  if (href === MY_TASKS_HREF) return bare === MY_TASKS_HREF
  if (href === APP_HOME) {
    return bare === APP_HOME || bare.startsWith(`${APP_HOME}/`)
  }
  return bare === href || bare.startsWith(`${href}/`)
}

/** Public worker directory. */
export const WORKER_SEARCH_HREF = '/workers' as const

/** Public marketing entry. */
export const MARKETING_HOME = '/home' as const

/** Paying & meeting safely — C2C pay + home-visit guidance. */
export const SAFETY_HREF = '/help/safety' as const

/** Marketing / store landing until dedicated app-store links exist. */
export const GET_APP_HREF = 'https://slashie.app' as const
