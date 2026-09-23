/**
 * In-dashboard navigation for the merged customer + worker account hub.
 *
 * Routes here are URL-unprefixed because `(dashboard)` is a Next route group,
 * not a URL segment. Overview owns `/dashboard`; everything else is a sibling.
 * Locale slugs (`/zh-hk`, legacy `/en`) are stripped before matching.
 */

import { stripLocalePrefix } from '@/i18n/navigation'

export type AccountNavKey =
  | 'overview'
  | 'tasks'
  | 'earnings'
  | 'billing'
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
  // Worker discovery lives at /workers.
  {
    key: 'tasks',
    label: 'My tasks',
    href: '/tasks',
    description:
      'Tasks you posted and tasks you quoted — open, booked, and completed.',
  },
  {
    key: 'earnings',
    label: 'Earnings',
    href: '/earnings',
    description:
      'Historical completed work — reference only, Slashie does not pay out.',
  },
  {
    key: 'billing',
    label: 'Billing',
    href: '/billing',
    description:
      'Slashie Unlimited subscription, quote allowance, and Stripe billing.',
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

export function resolveAccountNavKey(pathname: string | null): AccountNavKey {
  const path = stripLocalePrefix(pathname ?? '')
  if (path === '/tasks') return 'tasks'
  if (path.startsWith('/earnings')) return 'earnings'
  if (path.startsWith('/billing')) return 'billing'
  if (path.startsWith('/account')) return 'account'
  if (path.startsWith('/profile')) return 'profile'
  return 'overview'
}
