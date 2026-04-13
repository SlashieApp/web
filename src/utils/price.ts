import type { Currency, Price } from '@codegen/schema'

type PriceLike = Pick<Price, 'amount' | 'currency'> | null | undefined
type PriceAmountLike = { amount: number } | PriceLike | null | undefined

function toIsoCurrency(currency: Currency | string) {
  if (currency === 'GDP') return 'GBP'
  return currency
}

export function priceToPence(price: PriceAmountLike): number | null {
  const amount = price?.amount
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  return Math.round(amount * 100)
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
