/**
 * In-dashboard navigation for the merged customer + worker account hub.
 *
 * Routes here are URL-unprefixed because `(dashboard)` is a Next route group,
 * not a URL segment. Overview owns `/dashboard`; everything else is a sibling.
 */

export type AccountNavKey =
  | 'overview'
  | 'workers'
  | 'requests'
  | 'quotes'
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
  {
    key: 'workers',
    label: 'Workers',
    href: '/workers',
    description:
      'Browse worker profiles before you accept a quote on your tasks.',
  },
  {
    key: 'requests',
    label: 'My Requests',
    href: '/requests',
    description:
      'Tasks you posted as a customer — quotes, bookings, and completion.',
  },
  {
    key: 'quotes',
    label: 'My Quotes',
    href: '/quotes',
    description:
      'Quotes you sent on other people’s tasks — pending, booked, or done.',
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
  const path = pathname ?? ''
  if (path === '/workers') return 'workers'
  if (path.startsWith('/requests')) return 'requests'
  if (path.startsWith('/quotes')) return 'quotes'
  if (path.startsWith('/earnings')) return 'earnings'
  if (path.startsWith('/billing')) return 'billing'
  if (path.startsWith('/account')) return 'account'
  if (path.startsWith('/profile')) return 'profile'
  return 'overview'
}
