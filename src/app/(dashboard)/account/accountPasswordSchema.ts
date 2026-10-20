import { z } from 'zod'

/** The API's floor (WEAK_PASSWORD under 8), same as register and reset. */
export const PASSWORD_MIN_LENGTH = 8

/** Messages are keys into the bag's `password.validation`. */
export type AccountPasswordValidationKey =
  | 'currentRequired'
  | 'passwordTooShort'
  | 'passwordsDontMatch'
  | 'passwordUnchanged'

/**
 * `change`: password accounts replace theirs (`changePassword`); the current
 * password is the re-auth. `set`: Google / Apple-only accounts add a first
 * one (`setPassword`), so there is no current password.
 */
export type AccountPasswordMode = 'change' | 'set'

export function createAccountPasswordSchema(mode: AccountPasswordMode) {
  return z
    .object({
      currentPassword:
        mode === 'change' ? z.string().min(1, 'currentRequired') : z.string(),
      newPassword: z.string().min(PASSWORD_MIN_LENGTH, 'passwordTooShort'),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (
        mode === 'change' &&
        data.currentPassword &&
        data.newPassword === data.currentPassword
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'passwordUnchanged',
          path: ['newPassword'],
        })
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'passwordsDontMatch',
          path: ['confirmPassword'],
        })
      }
    })
}

export type AccountPasswordValues = z.infer<
  ReturnType<typeof createAccountPasswordSchema>
>
