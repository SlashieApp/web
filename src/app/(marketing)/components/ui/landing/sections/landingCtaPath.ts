/** Who is looking at the landing: the request has a session cookie or not. */
export type LandingSession = 'guest' | 'signedIn'

/**
 * Where a landing call to action goes (bare path, no locale). A guest signs
 * up first and carries the page on as `next`; a visitor who already has a
 * session goes straight there, not to a sign-up form they do not need.
 */
export function landingCtaPath(next: string, session: LandingSession): string {
  if (session === 'signedIn') return next
  return `/register?next=${encodeURIComponent(next)}`
}
