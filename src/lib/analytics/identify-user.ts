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

export function identifyAuthenticatedUser(
  user: AuthenticatedUserIdentity | null | undefined,
): void {
  try {
    if (!user?.id || typeof window === 'undefined') return
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
  } catch {
    // Analytics must never break auth flows.
  }
}

export function resetAnalyticsIdentity(): void {
  try {
    if (typeof window === 'undefined') return
    const posthog = getPostHog()
    posthog?.reset()
  } catch {
    // no-op
  }
}
