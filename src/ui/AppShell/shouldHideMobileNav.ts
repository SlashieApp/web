import { stripLocalePrefix } from '@/i18n/navigation'

/**
 * The signed-in account pages (the `(dashboard)` group: account, your own
 * profile, billing, admin) have their own back control in the page header
 * (FE-364). Public profiles (`/profile/:id`) keep the dock.
 */
const ACCOUNT_PAGE = /^\/(?:account|billing|admin)(?:\/|$)|^\/profile$/

/**
 * Task detail (`/tasks/:id`) and its owner preview use a floating primary CTA
 * instead of the dock. Other nested task routes (edit, quote) keep the nav.
 * An open message thread is full screen with its own composer, and the
 * account pages bring their own back control.
 */
export function shouldHideMobileNav(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname)
  if (ACCOUNT_PAGE.test(bare)) return true
  if (/^\/messages\/[^/]+$/.test(bare)) return true
  if (!/^\/tasks\/[^/]+(?:\/preview)?$/.test(bare)) return false
  return bare !== '/tasks/create'
}
