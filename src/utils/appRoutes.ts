/** Signed-in app home — unified map-first search (tasks + workers). */
export const APP_HOME = '/search' as const

/** Public worker directory. */
export const WORKER_SEARCH_HREF = '/workers' as const

/** Public marketing entry. */
export const MARKETING_HOME = '/home' as const

/** Paying & meeting safely — C2C pay + home-visit guidance. */
export const SAFETY_HREF = '/help/safety' as const

/**
 * Canonical public host is the apex. `www.slashie.app` 308s here (see
 * `src/proxy.ts` and `next.config.ts`) so cookies, canonical tags, and OG
 * URLs stay on one origin. `e.slashie.app` is the PostHog ingest host and
 * is not redirected.
 */
export const CANONICAL_HOST = 'slashie.app' as const
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}` as const
export const WWW_HOST = `www.${CANONICAL_HOST}` as const

/** Marketing / store landing until dedicated app-store links exist. */
export const GET_APP_HREF = CANONICAL_ORIGIN
