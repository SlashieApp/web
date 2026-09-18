export type LoginAutofill = {
  email: string
  password: string
}

export const EMPTY_LOGIN_AUTOFILL: LoginAutofill = { email: '', password: '' }

/**
 * Local-dev login form defaults from `AUTOFILL_EMAIL` / `AUTOFILL_PASSWORD`.
 * Empty in production so credentials never reach the client bundle.
 */
export function getLoginAutofill(
  env: NodeJS.ProcessEnv = process.env,
): LoginAutofill {
  if (env.NODE_ENV !== 'development') return EMPTY_LOGIN_AUTOFILL
  return {
    email: env.AUTOFILL_EMAIL?.trim() ?? '',
    password: env.AUTOFILL_PASSWORD ?? '',
  }
}
