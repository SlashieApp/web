'use client'

import { AUTH_COOKIE_NAME } from '@/utils/authCookie'

export { AUTH_COOKIE_NAME }

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function readCookieValue(cookieName: string) {
  if (typeof document === 'undefined') return null
  const cookiePrefix = `${cookieName}=`
  const cookie = document.cookie
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(cookiePrefix))
  if (!cookie) return null
  const raw = cookie.slice(cookiePrefix.length)
  const decoded = decodeCookieValue(raw).trim()
  return decoded.length > 0 ? decoded : null
}

export function setAuthToken(
  token: string,
  maxAgeSeconds: number = 60 * 60 * 24 * 7,
) {
  const safeToken = token.trim()
  if (!safeToken) return
  // Basic cookie storage. For production, consider Secure + SameSite.
  const maxAge = maxAgeSeconds
  const encodedToken = encodeURIComponent(safeToken)
  document.cookie = `${AUTH_COOKIE_NAME}=${encodedToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

export function clearAuthToken() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function getAuthToken() {
  return readCookieValue(AUTH_COOKIE_NAME)
}

/** Password changes in flight (`duringTokenSwap`). */
let tokenSwaps = 0

/**
 * Runs a password change, which ends every older token on the API and hands
 * this device a new one to store (BE-102). Meanwhile, and for requests sent
 * with the replaced token, a refusal must not sign this device out
 * (`isReplacedSession`).
 */
export async function duringTokenSwap<T>(change: () => Promise<T>): Promise<T> {
  tokenSwaps += 1
  try {
    return await change()
  } finally {
    tokenSwaps -= 1
  }
}

/**
 * Whether a request sent with `authorization` was refused only because a
 * password change is replacing (or has replaced) this device's token.
 */
export function isReplacedSession(authorization: unknown): boolean {
  if (tokenSwaps > 0) return true
  const current = getAuthToken()
  return (
    typeof authorization === 'string' &&
    current !== null &&
    authorization !== `Bearer ${current}`
  )
}
