/**
 * PECR/UK GDPR cookie-consent state for non-essential (analytics) cookies.
 * Persisted in localStorage so essential auth cookies keep working regardless
 * of the visitor's choice. PostHog is only initialised after 'accepted'
 * (see posthog-client.ts and CookieConsentBanner).
 */
export type CookieConsentValue = 'accepted' | 'rejected'
export type CookieConsentStatus = CookieConsentValue | 'unset'

export const COOKIE_CONSENT_STORAGE_KEY = 'slashie.cookie-consent'

type ConsentListener = (value: CookieConsentValue) => void

const listeners = new Set<ConsentListener>()

export function getCookieConsent(): CookieConsentStatus {
  if (typeof window === 'undefined') return 'unset'
  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    return stored === 'accepted' || stored === 'rejected' ? stored : 'unset'
  } catch {
    // Storage unavailable (privacy mode / blocked): treat as undecided.
    return 'unset'
  }
}

export function setCookieConsent(value: CookieConsentValue): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value)
  } catch {
    // Persisting failed; still notify so the current session honours the choice.
  }
  for (const listener of listeners) {
    listener(value)
  }
}

/** Subscribe to consent decisions made this session. Returns an unsubscribe. */
export function onCookieConsentChange(listener: ConsentListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
