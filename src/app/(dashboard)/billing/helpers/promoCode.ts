import type { CheckPromoCodeQuery } from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'
import { pickGraphQLError } from '@/utils/graphqlErrors'

import type bag from '../i11n.json'

/**
 * "Have a code?" on Pricing and Plan & billing (FE-586, BE-140; Ryan 21 Nov).
 * A code is checked for this worker, then Checkout starts with it. The Expo
 * app's `promoCode.ts` reads the same.
 */
export type PromoCopy = (typeof bag)['en']['promo']
export type PromoCheck = CheckPromoCodeQuery['checkPromoCode']
export type PromoProblem = keyof PromoCopy['problems']

/** The longest code the API looks up (`NOT_FOUND` beyond it). */
export const PROMO_CODE_MAX = 64

/** The code as the API reads it: trimmed (Stripe matches it ignoring case). */
export function normalizePromoCode(text: string): string {
  return text.trim()
}

function percentText(percent: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
    percent,
  )
}

function amountText(pence: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale === 'zh-HK' ? 'zh-HK' : 'en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pence / 100)
}

/**
 * What a working code takes off, and for how long: "50% off for 3 months",
 * "£5 off your first month", "20% off every month". A repeating code of one
 * month reads as the first month. Null when the check gives no discount.
 */
export function promoCodeGives(
  check: PromoCheck,
  copy: PromoCopy,
  locale: string,
): string | null {
  const g = copy.gives
  let kind: 'percent' | 'amount'
  let vars: Record<string, string | number>
  if (typeof check.percentOff === 'number' && check.percentOff > 0) {
    kind = 'percent'
    vars = { percent: percentText(check.percentOff, locale) }
  } else if (typeof check.amountOff === 'number' && check.amountOff > 0) {
    kind = 'amount'
    vars = {
      amount: amountText(check.amountOff, check.currency ?? 'gbp', locale),
    }
  } else {
    return null
  }
  const months = check.durationInMonths ?? 0
  if (check.duration === 'FOREVER') {
    return formatMessage(
      kind === 'percent' ? g.percentForever : g.amountForever,
      vars,
    )
  }
  if (check.duration === 'REPEATING' && months > 1) {
    return formatMessage(
      kind === 'percent' ? g.percentMonths : g.amountMonths,
      { ...vars, months },
    )
  }
  return formatMessage(kind === 'percent' ? g.percentOnce : g.amountOnce, vars)
}

/** The applied line: "LAUNCH50: 50% off for 3 months". */
export function promoAppliedLine(
  check: PromoCheck,
  copy: PromoCopy,
  locale: string,
): string {
  const gives = promoCodeGives(check, copy, locale)
  return gives
    ? formatMessage(copy.applied, { code: check.code, gives })
    : check.code
}

const PROBLEMS = new Set<string>([
  'NOT_FOUND',
  'EXPIRED',
  'USED_UP',
  'NOT_FOR_THIS_PLAN',
  'FIRST_TIME_ONLY',
])

/** A check's problem as a copy key; an unknown one reads as not found. */
export function promoProblemFromCheck(check: PromoCheck): PromoProblem {
  const problem = check.problem ?? 'NOT_FOUND'
  return (PROBLEMS.has(problem) ? problem : 'NOT_FOUND') as PromoProblem
}

/**
 * A failed check or Checkout as a copy key: too many tries, a code Checkout
 * refused (`PROMO_CODE_INVALID` with its reason), or null when the error is
 * not about the code (the caller shows its own).
 */
export function promoProblemFromError(error: unknown): PromoProblem | null {
  const gql = pickGraphQLError(error)
  const code = gql?.extensions?.code
  if (code === 'PROMO_CODE_RATE_LIMITED') return 'RATE_LIMITED'
  if (code === 'PROMO_CODE_INVALID') {
    const problem = (gql?.extensions as { problem?: unknown } | undefined)
      ?.problem
    return typeof problem === 'string' && PROBLEMS.has(problem)
      ? (problem as PromoProblem)
      : 'NOT_FOUND'
  }
  return null
}
