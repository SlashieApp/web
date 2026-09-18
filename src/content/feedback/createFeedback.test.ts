import { describe, expect, it } from 'vitest'

import { FEEDBACK_CATEGORY_VALUES } from '@/ui/FeedbackDialog/feedbackFormSchema'

import {
  FEEDBACK_ERROR_CODE,
  currentPageContext,
  getFeedbackErrorMessage,
  getFeedbackRetryAfterSeconds,
  toCreateFeedbackInput,
} from './createFeedback'

function gqlError(code: string, extensions?: Record<string, unknown>): unknown {
  return {
    graphQLErrors: [
      {
        message: code,
        extensions: { code, ...extensions },
      },
    ],
  }
}

const copy = {
  rateLimited: 'Wait {seconds}s.',
  rateLimitedGeneric: 'Wait a bit.',
  errorFallback: 'Failed.',
}

describe('createFeedback helpers', () => {
  it('keeps category values aligned with the BE enum', () => {
    expect([...FEEDBACK_CATEGORY_VALUES]).toEqual([
      'BUG',
      'RATING',
      'FEATURE_REQUEST',
      'GENERAL',
    ])
  })

  it('builds a createFeedback payload and omits empty optionals', () => {
    expect(
      toCreateFeedbackInput(
        {
          category: 'BUG',
          message: '  Map pins overlap.  ',
          name: '  ',
          email: 'alex@example.com',
          rating: undefined,
        },
        {
          pageUrl: 'https://slashie.app/search?mode=tasks',
          path: '/search?mode=tasks',
          userAgent: 'Mozilla/5.0',
        },
      ),
    ).toEqual({
      category: 'BUG',
      message: 'Map pins overlap.',
      email: 'alex@example.com',
      name: undefined,
      rating: undefined,
      pageUrl: 'https://slashie.app/search?mode=tasks',
      path: '/search?mode=tasks',
      userAgent: 'Mozilla/5.0',
    })
  })

  it('parses page URL and path from an absolute href', () => {
    expect(currentPageContext('https://slashie.app/tasks/abc?x=1#top')).toEqual(
      {
        pageUrl: 'https://slashie.app/tasks/abc?x=1#top',
        path: '/tasks/abc?x=1',
      },
    )
  })

  it('maps rate-limit errors, including retry-after', () => {
    expect(
      getFeedbackErrorMessage(
        gqlError(FEEDBACK_ERROR_CODE.RATE_LIMITED, { retryAfterSeconds: 12.2 }),
        copy,
      ),
    ).toBe('Wait 13s.')
    expect(
      getFeedbackErrorMessage(gqlError(FEEDBACK_ERROR_CODE.RATE_LIMITED), copy),
    ).toBe('Wait a bit.')
    expect(getFeedbackErrorMessage(gqlError('RATE_LIMITED'), copy)).toBe(
      'Wait a bit.',
    )
    expect(getFeedbackErrorMessage(gqlError('UNAUTHENTICATED'), copy)).toBe(
      'Failed.',
    )
    expect(getFeedbackRetryAfterSeconds(gqlError('OTHER'))).toBeNull()
  })
})
