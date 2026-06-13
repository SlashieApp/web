export type PricingCtaTarget = {
  href: string
  label: string
}

export function resolveFreePlanCta(): PricingCtaTarget {
  return {
    href: '/register',
    label: 'Get started',
  }
}

export function resolveUnlimitedPlanCta(options: {
  isAuthenticated: boolean
  hasWorkerProfile: boolean
  hasUnlimitedPlan?: boolean
}): PricingCtaTarget {
  if (options.hasUnlimitedPlan) {
    return {
      href: '/billing',
      label: 'Current plan',
    }
  }

  if (!options.isAuthenticated) {
    return {
      href: `/register?next=${encodeURIComponent('/billing')}`,
      label: 'Upgrade',
    }
  }

  if (options.hasWorkerProfile) {
    return {
      href: '/billing',
      label: 'Upgrade',
    }
  }

  return {
    href: '/worker/setup',
    label: 'Set up worker profile',
  }
}
