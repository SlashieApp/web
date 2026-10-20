import { formatMessage } from '@/i18n/loadPageI11n'

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

/**
 * A bag's `intervals` group: the unit in one and in many, and how a price
 * reads per one interval ("/ month") or per several ("every 3 months").
 */
export type PricingIntervalCopy = {
  month: string
  year: string
  months: string
  years: string
  /** After an amount, one interval: "/ {interval}". */
  perOne: string
  /** After an amount, several: "every {count} {interval}". */
  perMany: string
  /** Price and interval in one line: "{price} / {interval}". */
  priceOne: string
  /** "{price} every {count} {interval}" (zh-HK: "每 {count} {interval} {price}"). */
  priceMany: string
}

/** Charges every this many intervals; anything below 2 is one. */
export function pricingIntervalCount(
  pricing: Pick<PricingRecord, 'priceIntervalCount'>,
): number {
  const count = Math.floor(pricing.priceIntervalCount ?? 1)
  return Number.isFinite(count) && count > 1 ? count : 1
}

/** The interval for `count` of them in the page's language ("month", "months", "月", "個月"); unknown ones pass through. */
function intervalWord(
  interval: string,
  count: number,
  copy: PricingIntervalCopy,
): string {
  const key = formatPricingInterval(interval)
  if (key === 'month') return count > 1 ? copy.months : copy.month
  if (key === 'year') return count > 1 ? copy.years : copy.year
  return key
}

/** What follows the amount: "/ month", or "every 3 months". */
export function pricingPerInterval(
  pricing: Pick<PricingRecord, 'priceInterval' | 'priceIntervalCount'>,
  copy: PricingIntervalCopy,
): string {
  const count = pricingIntervalCount(pricing)
  const interval = intervalWord(pricing.priceInterval, count, copy)
  return count > 1
    ? formatMessage(copy.perMany, { count, interval })
    : formatMessage(copy.perOne, { interval })
}

/** The price with its interval: "£19.99 / month", "£54 every 3 months". */
export function pricingPriceLine(
  pricing: PricingRecord,
  copy: PricingIntervalCopy,
): string {
  const count = pricingIntervalCount(pricing)
  const price = pricingDisplayPrice(pricing)
  const interval = intervalWord(pricing.priceInterval, count, copy)
  return count > 1
    ? formatMessage(copy.priceMany, { price, count, interval })
    : formatMessage(copy.priceOne, { price, interval })
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
