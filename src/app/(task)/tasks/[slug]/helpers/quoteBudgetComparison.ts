export type QuoteBudgetComparison =
  | { kind: 'under'; difference: number }
  | { kind: 'over'; difference: number }
  | { kind: 'match' }

/** Where a quote sits against the posted budget (both in major units). */
export function quoteBudgetComparison(
  budgetAmount: number,
  quoteAmount: number,
): QuoteBudgetComparison {
  const difference = Math.round((quoteAmount - budgetAmount) * 100) / 100
  if (difference < 0) return { kind: 'under', difference: -difference }
  if (difference > 0) return { kind: 'over', difference }
  return { kind: 'match' }
}
