import { describe, expect, it } from 'vitest'

import {
  FEEDBACK_CATEGORY_VALUES,
  FEEDBACK_MESSAGE_MAX,
  feedbackFormSchema,
} from './feedbackFormSchema'

const validBase = {
  category: 'GENERAL' as const,
  message: 'The map is hard to pan on a laptop.',
  name: 'Alex',
  email: 'alex@example.com',
}

describe('feedbackFormSchema', () => {
  it('includes the BE-48 category enum', () => {
    expect([...FEEDBACK_CATEGORY_VALUES]).toEqual([
      'BUG',
      'RATING',
      'FEATURE_REQUEST',
      'GENERAL',
    ])
  })

  it('accepts optional name and optional rating when category is not Rating', () => {
    expect(
      feedbackFormSchema.safeParse({ ...validBase, name: '', rating: 4 })
        .success,
    ).toBe(true)
    expect(
      feedbackFormSchema.safeParse({ ...validBase, name: '' }).success,
    ).toBe(true)
  })

  it('requires a 1–5 rating when category is Rating', () => {
    expect(
      feedbackFormSchema.safeParse({
        ...validBase,
        category: 'RATING',
      }).success,
    ).toBe(false)
    expect(
      feedbackFormSchema.safeParse({
        ...validBase,
        category: 'RATING',
        rating: 5,
      }).success,
    ).toBe(true)
    expect(
      feedbackFormSchema.safeParse({
        ...validBase,
        category: 'RATING',
        rating: 0,
      }).success,
    ).toBe(false)
  })

  it('requires a message and a valid email', () => {
    expect(
      feedbackFormSchema.safeParse({ ...validBase, message: '   ' }).success,
    ).toBe(false)
    expect(
      feedbackFormSchema.safeParse({
        ...validBase,
        message: 'x'.repeat(FEEDBACK_MESSAGE_MAX + 1),
      }).success,
    ).toBe(false)
    expect(
      feedbackFormSchema.safeParse({ ...validBase, email: 'not-an-email' })
        .success,
    ).toBe(false)
    expect(
      feedbackFormSchema.safeParse({ ...validBase, email: '' }).success,
    ).toBe(false)
  })
})
