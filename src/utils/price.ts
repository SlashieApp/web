import type { Currency, Price, TaskBudget } from '@codegen/schema'

type PriceLike = Pick<Price, 'amount' | 'currency'> | null | undefined
type PriceAmountLike = { amount: number } | PriceLike | null | undefined
type BudgetLike =
  | (Pick<TaskBudget, 'amount'> & {
      currency?: TaskBudget['currency'] | string
    })
  | null
  | undefined

function toIsoCurrency(currency: Currency | string) {
  if (currency === 'GDP') return 'GBP'
  return currency
}

export function priceToPence(price: PriceAmountLike): number | null {
  const amount = price?.amount
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  return Math.round(amount * 100)
}

/** Budget amounts use major units (e.g. pounds), same as `Price`. */
export function budgetToPence(budget: BudgetLike): number | null {
  return priceToPence(budget)
}

export function formatPrice(price: PriceLike, fallback = 'Open') {
  if (!price) return fallback
  const currency = toIsoCurrency(price.currency)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price.amount)
}

export function formatBudgetAmount(budget: BudgetLike, fallback = 'Open') {
  if (!budget || budget.currency == null) return fallback
  const currency = toIsoCurrency(budget.currency)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(budget.amount)
}
