import { z } from 'zod'

export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Please enter your full name.'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email.')
      .email('Enter a valid email.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      })
    }
    if (!data.agreedToTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please agree to the Terms of Service and Privacy Policy.',
        path: ['agreedToTerms'],
      })
    }
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>
