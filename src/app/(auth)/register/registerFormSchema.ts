import { z } from 'zod'

/** Messages are keys into the page copy's `validation`. */
/**
 * Age and Terms are confirmed by the consent line above every way in
 * (FE-563), not by boxes in this form.
 */
export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'fullNameRequired'),
    email: z.string().trim().min(1, 'emailRequired').email('emailInvalid'),
    password: z.string().min(8, 'passwordTooShort'),
    confirmPassword: z.string(),
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
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>

export type RegisterValidationKey =
  | 'fullNameRequired'
  | 'emailRequired'
  | 'emailInvalid'
  | 'passwordTooShort'
  | 'passwordsDontMatch'
