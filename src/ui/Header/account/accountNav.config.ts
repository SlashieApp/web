import { APP_HOME, SAFETY_HREF, WORKER_SEARCH_HREF } from '@/utils/appRoutes'

import type bag from '../i11n.json'

export type AccountNavAudience = 'all' | 'worker' | 'non-worker' | 'admin'

export type AccountNavAction =
  | 'logout'
  | 'notifications'
  | 'feedback'
  | 'language'

export type AccountNavSection = 'main' | 'worker' | 'account'

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
    id: 'home',
    label: 'Home',
    href: APP_HOME,
    kind: 'link',
    section: 'main',
    audience: 'all',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
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
    href: '/dashboard/messages',
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
    id: 'billing',
    label: 'Billing & plan',
    href: '/billing',
    kind: 'link',
    section: 'worker',
    audience: 'worker',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    href: '/earnings',
    kind: 'link',
    section: 'worker',
    audience: 'worker',
  },
  {
    id: 'become-worker',
    label: 'Become a worker',
    href: '/worker/setup',
    kind: 'link',
    section: 'worker',
    audience: 'non-worker',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    kind: 'action',
    action: 'notifications',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    kind: 'link',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/account',
    kind: 'link',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'language',
    label: 'Language',
    kind: 'action',
    action: 'language',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'help',
    label: 'Help',
    href: '/about',
    kind: 'link',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'feedback',
    label: 'Send feedback',
    kind: 'action',
    action: 'feedback',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'safety',
    label: 'Paying & meeting safely',
    href: SAFETY_HREF,
    kind: 'link',
    section: 'account',
    audience: 'all',
  },
  {
    id: 'admin-notifications',
    label: 'Send a notification',
    href: '/admin/notifications',
    kind: 'link',
    section: 'account',
    audience: 'admin',
  },
  {
    id: 'logout',
    label: 'Log out',
    kind: 'action',
    action: 'logout',
    section: 'account',
    audience: 'all',
  },
] as const

export type AccountNavGroups = {
  main: AccountNavItem[]
  worker: AccountNavItem[]
  account: AccountNavItem[]
}

export function groupAccountNavItems(
  items: readonly AccountNavItem[],
): AccountNavGroups {
  return {
    main: items.filter((item) => item.section === 'main'),
    worker: items.filter((item) => item.section === 'worker'),
    account: items.filter((item) => item.section === 'account'),
  }
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
