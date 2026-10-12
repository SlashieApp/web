import { stripLocalePrefix } from '@/i18n/navigation'

/**
 * Task detail (`/tasks/:id`) and its owner preview use a floating primary CTA
 * instead of the dock. Other nested task routes (edit, quote) keep the nav.
 * An open message thread is full screen with its own composer.
 */
export function shouldHideMobileNav(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname)
  if (/^\/messages\/[^/]+$/.test(bare)) return true
  if (!/^\/tasks\/[^/]+(?:\/preview)?$/.test(bare)) return false
  return bare !== '/tasks/create'
}
