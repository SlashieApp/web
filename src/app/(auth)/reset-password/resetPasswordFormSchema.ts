import { z } from 'zod'

const numberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/

export const resetPasswordFormSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required.'),
    newPassword: z.string().min(8, 'Use at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!numberOrSymbol.test(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Include a number or symbol.',
        path: ['newPassword'],
      })
    }
    if (!/[A-Z]/.test(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Include one uppercase letter.',
        path: ['newPassword'],
      })
    }
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      })
    }
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>
