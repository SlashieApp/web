import { stripLocalePrefix } from '@/i18n/navigation'

/** True for `/search` (locale prefix allowed). */
export function isSearchBrowsePath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname.split('?')[0] || pathname)
  return path === '/search'
}

export function taskDetailHrefFromBrowse(
  taskId: string,
  options?: { fromSearch?: boolean },
): string {
  return options?.fromSearch
    ? `/tasks/${taskId}?from=search`
    : `/tasks/${taskId}`
}
