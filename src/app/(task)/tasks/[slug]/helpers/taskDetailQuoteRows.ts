import { QuoteStatus } from '@codegen/schema'

/**
 * The quotes task detail lists (FE-370). The owner gets every quote, with
 * who sent it. Anyone else, guests included, gets the other workers' live
 * (PENDING) quotes while the task is open, and never who sent them; their
 * own quote stays in the Task summary. Once the task isn't open there is
 * nothing to list for them.
 */
export function taskDetailQuoteRows<T extends { id: string; status: string }>(
  quotes: readonly T[],
  viewer: { isOwner: boolean; isOpen: boolean; myQuoteId: string | null },
): T[] {
  if (viewer.isOwner) return [...quotes]
  if (!viewer.isOpen) return []
  return quotes.filter(
    (quote) =>
      quote.status === QuoteStatus.Pending && quote.id !== viewer.myQuoteId,
  )
}
