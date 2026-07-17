import { APP_HOME, WORKER_SEARCH_HREF } from '@/utils/appRoutes'

export type AccountNavAudience = 'all' | 'worker' | 'non-worker'

export type AccountNavAction = 'logout' | 'notifications'

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
    id: 'requests',
    label: 'My requests',
    href: '/requests',
    kind: 'link',
    section: 'main',
    audience: 'all',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    href: '/quotes',
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
    id: 'help',
    label: 'Help',
    href: '/about',
    kind: 'link',
    section: 'account',
    audience: 'all',
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

export function resolveAccountNavItems(hasWorker: boolean): AccountNavItem[] {
  return ACCOUNT_NAV_ITEMS.filter((item) => {
    if (item.audience === 'all') return true
    if (item.audience === 'worker') return hasWorker
    return !hasWorker
  })
}
