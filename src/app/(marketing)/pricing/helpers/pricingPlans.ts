export function buildWorkerFreePlan(freeQuotesPerMonth: number) {
  return {
    key: 'worker-free',
    title: 'Worker Free',
    subtitle: 'For new workers',
    price: '£0',
    priceSuffix: 'Forever',
    badge: `${freeQuotesPerMonth} QUOTES / MONTH`,
    features: [
      'Browse tasks on the map',
      `Send up to ${freeQuotesPerMonth} quotes per month`,
      'Worker profile & reviews',
      'In-app job coordination',
      'Upgrade anytime',
    ],
  } as const
}

export const UNLIMITED_PLAN_FEATURES = [
  'Unlimited quotes every month',
  'Map-first task discovery',
  'Full platform access',
  'Manage billing & cancel anytime',
  'Same worker profile & reputation tools',
] as const

export const UNLIMITED_PLAN_RIBBON = 'BEST FOR ACTIVE WORKERS'
