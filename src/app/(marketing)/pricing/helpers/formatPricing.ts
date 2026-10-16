import type { PricingRecord } from './getPricingForPage'

/** "£19.99"; whole amounts drop the pence ("£0", "£20"). */
export function formatPricingAmount(
  amountMinor: number,
  currency: string,
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(amountMinor / 100)
}

export function formatPricingInterval(interval: string): string {
  return interval.trim().toLowerCase()
}

/** The interval in the page's language ("month" → "月"); unknown ones pass through. */
export function pricingIntervalLabel(
  interval: string,
  labels: { month: string; year: string },
): string {
  const key = formatPricingInterval(interval)
  return key === 'month' || key === 'year' ? labels[key] : key
}

/**
 * The trial for copy: whole 30-day months (180 → 6 months, as Stripe's
 * 180-day trial is sold), otherwise days. Null when there's no trial.
 */
export function pricingTrialLength(
  trialDays: number | null | undefined,
): { unit: 'month' | 'months' | 'days'; count: number } | null {
  if (!trialDays || trialDays <= 0) return null
  if (trialDays % 30 !== 0) return { unit: 'days', count: trialDays }
  const count = trialDays / 30
  return { unit: count === 1 ? 'month' : 'months', count }
}

export function pricingDisplayPrice(pricing: PricingRecord): string {
  return formatPricingAmount(pricing.priceAmount, pricing.priceCurrency)
}

export function pricingAfterTrialLine(pricing: PricingRecord): string {
  const price = pricingDisplayPrice(pricing)
  const interval = formatPricingInterval(pricing.priceInterval)
  return `${price} / ${interval} after trial`
}
