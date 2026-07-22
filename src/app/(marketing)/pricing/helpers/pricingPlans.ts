import { type Messages, formatMessage } from '@/i18n/getDictionary'

export function buildWorkerFreePlan(
  freeQuotesPerMonth: number,
  messages: Messages['pricing']['plans']['free'],
) {
  return {
    key: 'worker-free',
    title: messages.title,
    subtitle: messages.subtitle,
    price: messages.price,
    priceSuffix: messages.priceSuffix,
    badge: formatMessage(messages.badge, { count: freeQuotesPerMonth }),
    features: messages.features.map((feature) =>
      formatMessage(feature, { count: freeQuotesPerMonth }),
    ),
  } as const
}
