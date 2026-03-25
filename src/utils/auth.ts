'use client'

export const AUTH_COOKIE_NAME = 'auth'

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
