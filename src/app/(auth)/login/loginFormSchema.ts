import { z } from 'zod'

/** Messages are keys into the page copy's `validation`. */
export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'emailRequired').email('emailInvalid'),
  password: z.string().min(1, 'passwordRequired'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

export type LoginValidationKey =
  | 'emailRequired'
  | 'emailInvalid'
  | 'passwordRequired'
