/**
 * In-dashboard navigation for the merged customer + worker account hub.
 *
 * Routes here are URL-unprefixed because `(dashboard)` is a Next route group,
 * not a URL segment. Overview owns `/dashboard`; everything else is a sibling.
 */

export type AccountNavKey =
  | 'overview'
  | 'requests'
  | 'jobs'
  | 'earnings'
  | 'account'
  | 'profile'

export type AccountNavItem = {
  key: AccountNavKey
  label: string
  href: string
  description: string
}

export const ACCOUNT_NAV: ReadonlyArray<AccountNavItem> = [
  {
    key: 'overview',
    label: 'Overview',
    href: '/dashboard',
    description: 'Quick links and headline stats for your account.',
  },
  {
    key: 'requests',
    label: 'My Requests',
    href: '/requests',
    description:
      'Tasks you posted as customer, plus quotes you sent on others’ tasks.',
  },
  {
    key: 'jobs',
    label: 'Jobs',
    href: '/jobs',
    description: 'Tasks with an accepted quote, on either side of the booking.',
  },
  {
    key: 'earnings',
    label: 'Earnings',
    href: '/earnings',
    description:
      'Historical completed work — reference only, Slashie does not pay out.',
  },
  {
    key: 'account',
    label: 'Account',
    href: '/account',
    description: 'Settings, preferences, and session controls.',
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/profile',
    description: 'Customer profile plus worker setup when needed.',
  },
] as const

export { isAccountHubPath } from '@/utils/accountHub'

export function resolveAccountNavKey(pathname: string | null): AccountNavKey {
  const path = pathname ?? ''
  if (path.startsWith('/requests')) return 'requests'
  if (path.startsWith('/jobs')) return 'jobs'
  if (path.startsWith('/earnings')) return 'earnings'
  if (path.startsWith('/account')) return 'account'
  if (path.startsWith('/profile')) return 'profile'
  return 'overview'
}
