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
}): PricingCtaTarget {
  if (!options.isAuthenticated) {
    return {
      href: `/register?next=${encodeURIComponent('/billing')}`,
      label: 'Start free trial',
    }
  }

  if (options.hasWorkerProfile) {
    return {
      href: '/billing',
      label: 'Start free trial',
    }
  }

  return {
    href: '/worker/setup',
    label: 'Set up worker profile',
  }
}
