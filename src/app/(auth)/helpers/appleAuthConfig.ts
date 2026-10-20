/** Return URL path registered on the Apple Services ID (prod: https://slashie.app/auth/apple/callback). */
export const APPLE_CALLBACK_PATH = '/auth/apple/callback'

/** Services ID (`app.slashie.web.signin`); the Apple button stays hidden without it. */
export function getAppleClientId(): string {
  return process.env.NEXT_PUBLIC_APPLE_CLIENT_ID?.trim() ?? ''
}

export function isAppleAuthConfigured(): boolean {
  return getAppleClientId().length > 0
}

/**
 * Must exactly match a Return URL on the Services ID. In popup mode Apple
 * posts the result back to this URL's origin, so it has to be the page's
 * own origin: `NEXT_PUBLIC_APPLE_REDIRECT_URI` overrides for staging.
 */
export function getAppleRedirectUri(origin: string): string {
  return (
    process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI?.trim() ||
    `${origin}${APPLE_CALLBACK_PATH}`
  )
}

/** Apple's script locale folder for the UI language. */
export function appleScriptLocale(locale: string): string {
  return locale === 'zh-hk' ? 'zh_HK' : 'en_GB'
}

/**
 * Apple returns the name only on the first authorization; later sign-ins
 * omit it. Blank parts are dropped.
 */
export function appleFirstLoginName(
  name: { firstName?: string; lastName?: string } | null | undefined,
): { firstName?: string; lastName?: string } {
  const firstName = name?.firstName?.trim()
  const lastName = name?.lastName?.trim()
  return {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  }
}

/** What Apple's JS hands back from `AppleID.auth.signIn()` in popup mode. */
export type AppleSignInResponse = {
  authorization?: { id_token?: string; code?: string }
  user?: { email?: string; name?: { firstName?: string; lastName?: string } }
}

/** One Sign in with Apple result, ready for `loginWithMethod` or `linkLoginMethod`. */
export type AppleCredential = {
  idToken: string
  /** The raw nonce; Apple got its SHA-256 hex. */
  nonce?: string
  /** One-time code the API swaps for a refresh token (so deletion can revoke it). */
  authorizationCode?: string
  firstName?: string
  lastName?: string
}

/** Apple's authorization codes are short URL-safe strings; anything else is dropped. */
const APPLE_CODE_PATTERN = /^[A-Za-z0-9._-]{1,1024}$/

/** Apple's code when it looks like one, else undefined (sign-in works without it). */
export function safeAppleAuthorizationCode(
  code: string | null | undefined,
): string | undefined {
  const trimmed = code?.trim()
  return trimmed && APPLE_CODE_PATTERN.test(trimmed) ? trimmed : undefined
}

/** The credential from Apple's response, or null when it has no identity token. */
export function appleCredentialFromResponse(
  response: AppleSignInResponse,
  rawNonce: string,
): AppleCredential | null {
  const idToken = response.authorization?.id_token
  if (!idToken) return null
  const authorizationCode = safeAppleAuthorizationCode(
    response.authorization?.code,
  )
  return {
    idToken,
    nonce: rawNonce,
    ...(authorizationCode ? { authorizationCode } : {}),
    ...appleFirstLoginName(response.user?.name),
  }
}
