/**
 * How this browser last signed in (FE-563), so the email form can start open
 * for someone who uses email. Only the method is kept, never the address.
 * Listed in the Cookie Policy under essential storage.
 */
export const LAST_SIGN_IN_KEY = 'slashie.last-sign-in'

export type SignInMethod = 'email' | 'google' | 'apple'

const METHODS: readonly SignInMethod[] = ['email', 'google', 'apple']

export function readLastSignIn(): SignInMethod | null {
  try {
    const value = window.localStorage.getItem(LAST_SIGN_IN_KEY)
    return METHODS.includes(value as SignInMethod)
      ? (value as SignInMethod)
      : null
  } catch {
    return null
  }
}

export function rememberSignIn(method: SignInMethod): void {
  try {
    window.localStorage.setItem(LAST_SIGN_IN_KEY, method)
  } catch {
    // Storage blocked: the form just starts closed next time.
  }
}
