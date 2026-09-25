import { z } from 'zod'

import { REVIEW_COMMENT_MAX } from '@/content/reviews/reviewModel'

export const reviewFormSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(REVIEW_COMMENT_MAX),
  })
  .superRefine((data, ctx) => {
    if (data.rating == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a star rating.',
        path: ['rating'],
      })
    }
  })

export type ReviewFormValues = z.infer<typeof reviewFormSchema>

export const REVIEW_FORM_DEFAULTS: ReviewFormValues = {
  rating: undefined,
  comment: '',
}
