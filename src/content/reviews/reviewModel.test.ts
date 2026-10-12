import { describe, expect, it } from 'vitest'

import {
  MIN_PUBLIC_RATING_COUNT,
  REVIEW_EDIT_WINDOW_MS,
  orderReceiptPdfUrl,
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
