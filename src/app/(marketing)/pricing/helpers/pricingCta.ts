export type PricingCtaTarget = {
  href: string
  label: string
}

type PricingCtaLabels = {
  currentPlan: string
  setUpWorkerProfile: string
  upgrade: string
}

export function resolveFreePlanCta(): PricingCtaTarget {
  return {
    href: '/register',
    label: 'Get started',
  }
}

export function resolveUnlimitedPlanCta(options: {
  labels: PricingCtaLabels
  isAuthenticated: boolean
  hasWorkerProfile: boolean
  hasUnlimitedPlan?: boolean
}): PricingCtaTarget {
  if (options.hasUnlimitedPlan) {
    return {
      href: '/billing',
      label: options.labels.currentPlan,
    }
  }

  if (!options.isAuthenticated) {
    return {
      href: `/register?next=${encodeURIComponent('/billing')}`,
      label: options.labels.upgrade,
    }
  }

  if (options.hasWorkerProfile) {
    return {
      href: '/billing',
      label: options.labels.upgrade,
    }
  }

  return {
    href: '/worker/setup',
    label: options.labels.setUpWorkerProfile,
  }
}
