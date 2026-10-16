import { z } from 'zod'

/**
 * Messages are keys into the page copy's `validation`. The password rule is
 * the API's (8+ characters), the same as register.
 */
export const resetPasswordFormSchema = z
  .object({
    token: z.string().trim().min(1, 'tokenRequired'),
    newPassword: z.string().min(8, 'passwordTooShort'),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passwordsDontMatch',
        path: ['confirmPassword'],
      })
    }
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export type ResetPasswordValidationKey =
  | 'tokenRequired'
  | 'passwordTooShort'
  | 'passwordsDontMatch'
