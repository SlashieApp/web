import { stripLocalePrefix } from '@/i18n/navigation'

/**
 * Task detail (`/tasks/:id`) uses a floating primary CTA instead of the dock.
 * Nested task routes (edit, quote) keep the nav.
 */
export function shouldHideMobileNav(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname)
  if (!/^\/tasks\/[^/]+$/.test(bare)) return false
  return bare !== '/tasks/create'
}
