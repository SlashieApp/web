import type { PricingRecord } from './getPricingForPage'

export function formatPricingAmount(
  amountMinor: number,
  currency: string,
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100)
}

export function formatPricingInterval(interval: string): string {
  const normalised = interval.trim().toLowerCase()
  if (normalised === 'month') return 'month'
  if (normalised === 'year') return 'year'
  return normalised
}

export function pricingDisplayPrice(pricing: PricingRecord): string {
  return formatPricingAmount(pricing.priceAmount, pricing.priceCurrency)
}

export function pricingAfterTrialLine(pricing: PricingRecord): string {
  const price = pricingDisplayPrice(pricing)
  const interval = formatPricingInterval(pricing.priceInterval)
  return `${price} / ${interval} after trial`
}
