import { APP_HOME } from '@/utils/appRoutes'

export type AuthRedirectIntent = 'customer' | 'worker'

const SAME_ORIGIN_BASE = 'https://slashie.invalid'

/**
 * An in-app path from `?next=` / `?redirect=`, or null. Only same-origin
 * paths pass: browsers read a backslash after the first slash as `//`
 * (protocol-relative), so the value is parsed as a URL and its origin
 * checked, not just its prefix.
 */
export function getSafeNextPath(
  next?: string | null,
  redirect?: string | null,
): string | null {
  const requested = (next ?? redirect)?.trim()
  if (!requested?.startsWith('/') || requested.includes('\\')) return null
  try {
    const url = new URL(requested, SAME_ORIGIN_BASE)
    if (url.origin !== SAME_ORIGIN_BASE) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function resolvePostAuthRedirect(options: {
  next?: string | null
  redirect?: string | null
  intent?: AuthRedirectIntent | null
  emailVerified?: boolean
  /** Where to send the user when no `next` / `redirect` / register intent applies. */
  fallback?: string
}): string {
  const safeNext = getSafeNextPath(options.next, options.redirect)

  if (options.emailVerified === false) {
    const params = new URLSearchParams()
    if (safeNext) params.set('next', safeNext)
    const query = params.toString()
    return query ? `/verify-email/sent?${query}` : '/verify-email/sent'
  }

  if (safeNext) return safeNext
  if (options.intent === 'worker') return '/profile'
  if (options.intent === 'customer') return '/tasks/create'
  return options.fallback ?? APP_HOME
}
