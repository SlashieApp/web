'use client'

export function setAuthToken(token: string) {
  // Basic cookie storage (7 days). For production, consider Secure + SameSite.
  const maxAge = 60 * 60 * 24 * 7
  document.cookie = `auth=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

export function clearAuthToken() {
  document.cookie = 'auth=; Path=/; Max-Age=0; SameSite=Lax'
}

export function getAuthToken() {
  const match = RegExp('auth=([^;]+)').exec(document.cookie)
  return match?.[1] ?? null
}
