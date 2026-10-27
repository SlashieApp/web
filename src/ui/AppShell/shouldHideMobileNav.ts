import { stripLocalePrefix } from '@/i18n/navigation'

/**
 * Pages in the shell that are not nav pages (FE-445): the signed-in account
 * pages (the `(dashboard)` group: account, your own profile, billing, admin),
 * Workers (opened from the Account menu) and a public profile (`/profile/:id`)
 * and its retired `/workers/:id`. Each brings its own back control (FE-364).
 */
const BACK_PAGE = /^\/(?:account|billing|admin|profile|workers)(?:\/|$)/

/**
 * The bottom nav is for Search, My tasks and Messages. Any other page in the
 * shell has a back control instead and hides it: task detail (`/tasks/:id`)
 * and its owner preview use a floating primary CTA, an open message thread is
 * full screen with its own composer, and the pages above bring their own back.
 * Other nested task routes (edit, quote) are step flows outside the shell.
 */
export function shouldHideMobileNav(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname)
  if (BACK_PAGE.test(bare)) return true
  if (/^\/messages\/[^/]+$/.test(bare)) return true
  if (!/^\/tasks\/[^/]+(?:\/preview)?$/.test(bare)) return false
  return bare !== '/tasks/create'
}
