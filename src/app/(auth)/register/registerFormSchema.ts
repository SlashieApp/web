import { z } from 'zod'

/** Messages are keys into the page copy's `validation`. */
export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'fullNameRequired'),
    email: z.string().trim().min(1, 'emailRequired').email('emailInvalid'),
    password: z.string().min(8, 'passwordTooShort'),
    confirmPassword: z.string(),
    isOver18: z.boolean(),
    agreedToTerms: z.boolean(),
    /** Optional, unticked (BE-65: marketing email is opt-in). */
    marketingOptIn: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passwordsDontMatch',
        path: ['confirmPassword'],
      })
    }
    if (!data.isOver18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'over18Required',
        path: ['isOver18'],
      })
    }
    if (!data.agreedToTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'termsRequired',
        path: ['agreedToTerms'],
      })
    }
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>

export type RegisterValidationKey =
  | 'fullNameRequired'
  | 'emailRequired'
  | 'emailInvalid'
  | 'passwordTooShort'
  | 'passwordsDontMatch'
  | 'over18Required'
  | 'termsRequired'
