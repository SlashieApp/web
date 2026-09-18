import { z } from 'zod'

/** Matches BE-48 `CreateFeedbackInput.category`. */
export const FEEDBACK_CATEGORY_VALUES = [
  'BUG',
  'RATING',
  'FEATURE_REQUEST',
  'GENERAL',
] as const

export type FeedbackCategoryValue = (typeof FEEDBACK_CATEGORY_VALUES)[number]

export const FEEDBACK_MESSAGE_MAX = 2000
export const FEEDBACK_NAME_MAX = 120

export const feedbackFormSchema = z
  .object({
    category: z.enum(FEEDBACK_CATEGORY_VALUES, {
      error: 'Choose a category.',
    }),
    rating: z.number().int().min(1).max(5).optional(),
    message: z
      .string()
      .trim()
      .min(1, 'Enter a message.')
      .max(FEEDBACK_MESSAGE_MAX),
    name: z.string().trim().max(FEEDBACK_NAME_MAX),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email.')
      .email('Enter a valid email.'),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'RATING' && data.rating == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a rating from 1 to 5.',
        path: ['rating'],
      })
    }
  })

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>

export const FEEDBACK_FORM_DEFAULTS: FeedbackFormValues = {
  category: 'GENERAL',
  rating: undefined,
  message: '',
  name: '',
  email: '',
}
