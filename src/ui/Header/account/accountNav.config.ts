import { APP_HOME, SAFETY_HREF, WORKER_SEARCH_HREF } from '@/utils/appRoutes'

import type bag from '../i11n.json'

export type AccountNavAudience = 'all' | 'worker' | 'non-worker' | 'admin'

export type AccountNavAction =
  | 'logout'
  | 'feedback'
  | 'language'
  | 'cookieSettings'

export type AccountNavSection = 'main' | 'settings' | 'more'

export type AccountNavItem = {
  id: string
  label: string
  href?: string
  kind: 'link' | 'action'
  action?: AccountNavAction
  section: AccountNavSection
  audience: AccountNavAudience
}

export type AccountMenuI11n = (typeof bag)['en']

/** Resolve a nav item label from the Header i11n bag, falling back to config English. */
export function accountNavLabel(
  copy: AccountMenuI11n,
  navId: string,
  fallback: string,
): string {
  const fromBag = copy.nav[navId as keyof AccountMenuI11n['nav']]
  return typeof fromBag === 'string' && fromBag.trim() ? fromBag : fallback
}

/** Single source of account navigation links for mobile drawer and desktop dropdown. */
export const ACCOUNT_NAV_ITEMS: readonly AccountNavItem[] = [
  {
    id: 'search',
    label: 'Search',
    href: APP_HOME,
    kind: 'link',
    section: 'main',
    audience: 'all',
  },
  {
    id: 'my-tasks',
    label: 'My tasks',
    href: '/tasks',
    kind: 'link',
    section: 'main',
    audience: 'all',
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/messages',
    kind: 'link',
    section: 'main',
    audience: 'all',
  },
  {
    id: 'workers',
    label: 'Workers',
    href: WORKER_SEARCH_HREF,
    kind: 'link',
    section: 'main',
    audience: 'all',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    kind: 'link',
    section: 'settings',
    audience: 'all',
  },
  {
    id: 'account',
    label: 'Account',
    href: '/account',
    kind: 'link',
    section: 'settings',
    audience: 'all',
  },
  {
    id: 'billing',
    label: 'Plan & billing',
    href: '/billing',
    kind: 'link',
    section: 'settings',
    audience: 'worker',
  },
  {
    id: 'become-worker',
    label: 'Become a worker',
    href: '/worker/setup',
    kind: 'link',
    section: 'settings',
    audience: 'non-worker',
  },
  {
    id: 'language',
    label: 'Language',
    kind: 'action',
    action: 'language',
    section: 'more',
    audience: 'all',
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    kind: 'link',
    section: 'more',
    audience: 'all',
  },
  {
    id: 'feedback',
    label: 'Send feedback',
    kind: 'action',
    action: 'feedback',
    section: 'more',
    audience: 'all',
  },
  {
    id: 'safety',
    label: 'Paying & meeting safely',
    href: SAFETY_HREF,
    kind: 'link',
    section: 'more',
    audience: 'all',
  },
  // The app has no footer (FE-368), so the legal pages and cookie choices live here.
  {
    id: 'terms',
    label: 'Terms',
    href: '/terms',
    kind: 'link',
    section: 'more',
    audience: 'all',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    href: '/privacy',
    kind: 'link',
    section: 'more',
    audience: 'all',
  },
  {
    id: 'cookie-settings',
    label: 'Cookie settings',
    kind: 'action',
    action: 'cookieSettings',
    section: 'more',
    audience: 'all',
  },
  {
    id: 'admin-notifications',
    label: 'Send an announcement',
    href: '/admin/notifications',
    kind: 'link',
    section: 'more',
    audience: 'admin',
  },
  {
    id: 'logout',
    label: 'Log out',
    kind: 'action',
    action: 'logout',
    section: 'more',
    audience: 'all',
  },
] as const

/** Main links, then the settings pages, then language, help and Log out. */
export function groupAccountNavItems(
  items: readonly AccountNavItem[],
): AccountNavItem[][] {
  const sections: AccountNavSection[] = ['main', 'settings', 'more']
  return sections
    .map((section) => items.filter((item) => item.section === section))
    .filter((group) => group.length > 0)
}

export function resolveAccountNavItems(
  hasWorker: boolean,
  options?: { isAdmin?: boolean },
): AccountNavItem[] {
  const isAdmin = options?.isAdmin ?? false
  return ACCOUNT_NAV_ITEMS.filter((item) => {
    if (item.audience === 'admin') return isAdmin
    if (item.audience === 'all') return true
    if (item.audience === 'worker') return hasWorker
    return !hasWorker
  })
}
