/** C2C review rules. Product lock 2026-09-24. */

export const REVIEW_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000
export const MIN_PUBLIC_RATING_COUNT = 3
export const REVIEW_COMMENT_MAX = 500

export type C2CReview = {
  id: string
  stars: number
  comment?: string | null
  createdAt?: string | null
}

export function reviewCanEdit(
  review: { createdAt?: string | null } | null | undefined,
  now = Date.now(),
): boolean {
  if (!review?.createdAt) return false
  const created = new Date(review.createdAt).getTime()
  if (Number.isNaN(created)) return false
  return now - created <= REVIEW_EDIT_WINDOW_MS
}

export function orderReceiptPdfUrl(orderId: string, apiBase: string): string {
  const base = apiBase.replace(/\/graphql\/?$/, '').replace(/\/$/, '')
  return `${base}/orders/${encodeURIComponent(orderId)}/receipt.pdf`
}

export function publicRatingAverage(
  summary:
    | { average?: number | null; count?: number | null }
    | null
    | undefined,
): number | null {
  const count = summary?.count ?? 0
  if (count < MIN_PUBLIC_RATING_COUNT) return null
  const average = summary?.average
  if (average == null || Number.isNaN(average)) return null
  return average
}

export type RatingSummaryCopy = {
  none: string
  countOnly: string
  withAverage: string
}

/** Count is visible below the threshold. The average is not. */
export function ratingSummaryLabel(
  summary:
    | { average?: number | null; count?: number | null }
    | null
    | undefined,
  copy: RatingSummaryCopy,
): string {
  const count = summary?.count ?? 0
  if (count <= 0) return copy.none
  const average = publicRatingAverage(summary)
  if (average == null) {
    return copy.countOnly.replaceAll('{count}', String(count))
  }
  return copy.withAverage
    .replaceAll('{average}', average.toFixed(1))
    .replaceAll('{count}', String(count))
}
