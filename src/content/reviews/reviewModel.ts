/** C2C review + notification-surface rules. Product lock 2026-09-24. */

export const REVIEW_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000
export const REVIEW_PROMPT_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000
export const MIN_PUBLIC_RATING_COUNT = 3
export const REVIEW_COMMENT_MAX = 500

/** Notification type emitted when an order becomes COMPLETED (BE-59). */
export const NOTIFICATION_TYPE_REVIEW_PROMPT = 'REVIEW_PROMPT'

/** Admin cohort keys (BE-60). These do not gate who can leave a review. */
export const NOTIFICATION_COHORT_KEYS = [
  'founding_workers',
  'geo_watford_bushey',
] as const

export type NotificationCohortKey = (typeof NOTIFICATION_COHORT_KEYS)[number]

export type C2CReview = {
  id: string
  rating: number
  comment?: string | null
  createdAt?: string | null
}

export type PopupCandidate = {
  id: string
  type: string
  orderId?: string | null
  createdAt?: unknown
  isPopup?: boolean | null
  isClosed?: boolean | null
  dismissedAt?: string | null
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

/** True while a dismiss should keep the land popup hidden (7 days). */
export function isDismissSnoozed(
  dismissedAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!dismissedAt) return false
  const dismissed = new Date(dismissedAt).getTime()
  if (Number.isNaN(dismissed)) return false
  return now - dismissed < REVIEW_PROMPT_SNOOZE_MS
}

function createdTime(value: unknown): number {
  if (typeof value === 'string' || typeof value === 'number') {
    const time = new Date(value).getTime()
    return Number.isNaN(time) ? 0 : time
  }
  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isNaN(time) ? 0 : time
  }
  return 0
}

/**
 * One land popup: newest eligible `isPopup` row, one per order.
 * Closed rows and a live 7-day snooze stay out. Read state is ignored.
 */
export function pickLandPopup<T extends PopupCandidate>(
  items: readonly T[],
  options?: { now?: number; suppressedIds?: ReadonlySet<string> },
): T | null {
  const now = options?.now ?? Date.now()
  const suppressed = options?.suppressedIds
  const eligible = items.filter((item) => {
    if (!item.isPopup || item.isClosed) return false
    if (suppressed?.has(item.id)) return false
    if (isDismissSnoozed(item.dismissedAt, now)) return false
    return true
  })
  eligible.sort((a, b) => createdTime(b.createdAt) - createdTime(a.createdAt))
  const seenOrders = new Set<string>()
  for (const item of eligible) {
    const orderKey = item.orderId?.trim() || item.id
    if (seenOrders.has(orderKey)) continue
    seenOrders.add(orderKey)
    return item
  }
  return null
}

export function isReviewPrompt(type: string | null | undefined): boolean {
  return type === NOTIFICATION_TYPE_REVIEW_PROMPT
}

/**
 * Review prompts snooze through `dismissReviewPrompt`. Other popups use
 * `dismissNotification`. Neither marks the row closed.
 */
export function popupDismissKind(
  item: Pick<PopupCandidate, 'type' | 'orderId'>,
): 'review-prompt' | 'notification' {
  if (isReviewPrompt(item.type) && item.orderId?.trim()) return 'review-prompt'
  return 'notification'
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
