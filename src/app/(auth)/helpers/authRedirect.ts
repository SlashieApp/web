export type AuthRedirectIntent = 'customer' | 'worker'

export function getSafeNextPath(
  next?: string | null,
  redirect?: string | null,
): string | null {
  const requested = next ?? redirect
  if (requested?.startsWith('/') && !requested.startsWith('//')) {
    return requested
  }
  return null
}

export function resolvePostAuthRedirect(options: {
  next?: string | null
  redirect?: string | null
  intent?: AuthRedirectIntent | null
  emailVerified?: boolean
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
  return '/dashboard'
}
