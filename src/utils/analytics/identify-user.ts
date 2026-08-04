import { getPostHog, initPostHogClient } from './posthog-client'

export type AuthenticatedUserIdentity = {
  id: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  emailVerified?: boolean
  phoneVerified?: boolean
  isWorker?: boolean
}

let pendingIdentity: AuthenticatedUserIdentity | null = null

function identify(user: AuthenticatedUserIdentity): void {
  initPostHogClient()
  const posthog = getPostHog()
  if (!posthog) return

  posthog.identify(user.id, {
    email: user.email ?? undefined,
    name:
      [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
    email_verified: user.emailVerified,
    phone_verified: user.phoneVerified,
    is_worker: user.isWorker,
  })
}

export function identifyAuthenticatedUser(
  user: AuthenticatedUserIdentity | null | undefined,
): void {
  try {
    if (!user?.id || typeof window === 'undefined') return
    pendingIdentity = user
    identify(user)
  } catch {
    // Analytics must never break auth flows.
  }
}

/**
 * Identifies an already-authenticated user once analytics consent allows the
 * PostHog client to initialize. Login and refresh identity remain the source.
 */
export function syncPendingAnalyticsIdentity(): void {
  try {
    if (typeof window === 'undefined' || !pendingIdentity) return
    identify(pendingIdentity)
  } catch {
    // Analytics must never break auth flows.
  }
}

export function resetAnalyticsIdentity(): void {
  pendingIdentity = null
  try {
    if (typeof window === 'undefined') return
    const posthog = getPostHog()
    posthog?.reset()
  } catch {
    // no-op
  }
}
