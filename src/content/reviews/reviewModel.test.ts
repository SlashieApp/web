import { describe, expect, it } from 'vitest'

import {
  MIN_PUBLIC_RATING_COUNT,
  NOTIFICATION_TYPE_REVIEW_PROMPT,
  REVIEW_EDIT_WINDOW_MS,
  REVIEW_PROMPT_SNOOZE_MS,
  isDismissSnoozed,
  isReviewPrompt,
  orderReceiptPdfUrl,
  pickLandPopup,
  popupDismissKind,
  publicRatingAverage,
  ratingSummaryLabel,
  reviewCanEdit,
} from './reviewModel'

const copy = {
  none: 'No reviews yet',
  countOnly: '{count} reviews',
  withAverage: '{average} ({count} reviews)',
}

describe('review edit window', () => {
  const created = '2026-09-01T12:00:00.000Z'
  const createdMs = new Date(created).getTime()

  it('allows edits through 48 hours', () => {
    expect(reviewCanEdit({ createdAt: created }, createdMs + 1000)).toBe(true)
    expect(
      reviewCanEdit({ createdAt: created }, createdMs + REVIEW_EDIT_WINDOW_MS),
    ).toBe(true)
  })

  it('locks after 48 hours', () => {
    expect(
      reviewCanEdit(
        { createdAt: created },
        createdMs + REVIEW_EDIT_WINDOW_MS + 1,
      ),
    ).toBe(false)
    expect(reviewCanEdit(null)).toBe(false)
  })
})

describe('popup snooze', () => {
  const dismissed = '2026-09-01T00:00:00.000Z'
  const dismissedMs = new Date(dismissed).getTime()

  it('hides a popup for 7 days after dismissedAt', () => {
    expect(isDismissSnoozed(dismissed, dismissedMs + 1000)).toBe(true)
    expect(
      isDismissSnoozed(dismissed, dismissedMs + REVIEW_PROMPT_SNOOZE_MS - 1),
    ).toBe(true)
    expect(
      isDismissSnoozed(dismissed, dismissedMs + REVIEW_PROMPT_SNOOZE_MS),
    ).toBe(false)
    expect(isDismissSnoozed(null)).toBe(false)
  })

  it('picks one isPopup row per order and ignores read', () => {
    const picked = pickLandPopup(
      [
        {
          id: 'old',
          type: NOTIFICATION_TYPE_REVIEW_PROMPT,
          orderId: 'order-1',
          createdAt: '2026-09-01T00:00:00.000Z',
          isPopup: true,
        },
        {
          id: 'new',
          type: NOTIFICATION_TYPE_REVIEW_PROMPT,
          orderId: 'order-1',
          createdAt: '2026-09-03T00:00:00.000Z',
          isPopup: true,
        },
        {
          id: 'closed',
          type: 'TASK_COMPLETED',
          orderId: 'order-2',
          createdAt: '2026-09-04T00:00:00.000Z',
          isPopup: true,
          isClosed: true,
        },
        {
          id: 'snoozed',
          type: NOTIFICATION_TYPE_REVIEW_PROMPT,
          orderId: 'order-3',
          createdAt: '2026-09-05T00:00:00.000Z',
          isPopup: true,
          dismissedAt: '2026-09-20T00:00:00.000Z',
        },
      ],
      { now: new Date('2026-09-22T00:00:00.000Z').getTime() },
    )
    expect(picked?.id).toBe('new')
  })

  it('skips locally suppressed ids and does not treat read as dismissed', () => {
    const picked = pickLandPopup(
      [
        {
          id: 'a',
          type: 'GENERAL',
          orderId: 'o1',
          isPopup: true,
          createdAt: '2026-09-02T00:00:00.000Z',
        },
        {
          id: 'b',
          type: NOTIFICATION_TYPE_REVIEW_PROMPT,
          orderId: 'o2',
          isPopup: true,
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ],
      { suppressedIds: new Set(['a']) },
    )
    expect(picked?.id).toBe('b')
    expect(isReviewPrompt(picked?.type)).toBe(true)
    expect(popupDismissKind(picked ?? { type: '' })).toBe('review-prompt')
    expect(popupDismissKind({ type: 'GENERAL' })).toBe('notification')
  })
})

describe('receipt url', () => {
  it('builds the order PDF path on the API origin', () => {
    expect(orderReceiptPdfUrl('ord 1', 'https://api.slashie.app/graphql')).toBe(
      'https://api.slashie.app/orders/ord%201/receipt.pdf',
    )
  })
})

describe('public rating', () => {
  it('hides the average until three reviews', () => {
    expect(publicRatingAverage({ average: 5, count: 1 })).toBeNull()
    expect(publicRatingAverage({ average: 5, count: 2 })).toBeNull()
    expect(
      publicRatingAverage({ average: 4.5, count: MIN_PUBLIC_RATING_COUNT }),
    ).toBe(4.5)
    expect(publicRatingAverage({ average: null, count: 4 })).toBeNull()
  })

  it('labels a count without inventing an average', () => {
    expect(ratingSummaryLabel({ average: 5, count: 2 }, copy)).toBe('2 reviews')
    expect(ratingSummaryLabel({ average: 4.25, count: 4 }, copy)).toBe(
      '4.3 (4 reviews)',
    )
    expect(ratingSummaryLabel({ average: null, count: 0 }, copy)).toBe(
      'No reviews yet',
    )
  })
})
