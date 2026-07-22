import { formatMessage } from '@/i18n/loadPageI11n'

export type WorkerFreePlanCopy = {
  title: string
  subtitle: string
  price: string
  priceSuffix: string
  badge: string
  features: readonly string[]
}

export function buildWorkerFreePlan(
  freeQuotesPerMonth: number,
  copy: WorkerFreePlanCopy,
) {
  return {
    key: 'worker-free',
    title: copy.title,
    subtitle: copy.subtitle,
    price: copy.price,
    priceSuffix: copy.priceSuffix,
    badge: formatMessage(copy.badge, { count: freeQuotesPerMonth }),
    features: copy.features.map((feature) =>
      formatMessage(feature, { count: freeQuotesPerMonth }),
    ),
  } as const
}
