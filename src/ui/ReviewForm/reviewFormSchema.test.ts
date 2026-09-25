import { describe, expect, it } from 'vitest'

import { REVIEW_COMMENT_MAX } from '@/content/reviews/reviewModel'

import { reviewFormSchema } from './reviewFormSchema'

describe('reviewFormSchema', () => {
  it('requires a star from 1 to 5 and allows an empty comment', () => {
    expect(reviewFormSchema.safeParse({ rating: 4, comment: '' }).success).toBe(
      true,
    )
    expect(reviewFormSchema.safeParse({ comment: 'Nice work' }).success).toBe(
      false,
    )
    expect(reviewFormSchema.safeParse({ rating: 0, comment: '' }).success).toBe(
      false,
    )
    expect(reviewFormSchema.safeParse({ rating: 6, comment: '' }).success).toBe(
      false,
    )
  })

  it('caps the comment', () => {
    const comment = 'a'.repeat(REVIEW_COMMENT_MAX + 1)
    expect(reviewFormSchema.safeParse({ rating: 5, comment }).success).toBe(
      false,
    )
  })
})
