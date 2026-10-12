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
