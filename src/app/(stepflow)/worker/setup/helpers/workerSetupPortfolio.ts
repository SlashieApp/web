/** Most photos a portfolio keeps (TOO_MANY_PORTFOLIO_URLS above it). */
export const PORTFOLIO_URLS_MAX = 12

/** Per photo, before upload: the task photo limit. */
export const PORTFOLIO_PHOTO_MAX_MB = 10

/** The host our own uploads are served from. */
const MEDIA_HOSTS: readonly string[] = ['cdn.slashie.app']

/** How the API names an uploaded portfolio photo, on whichever storage host. */
const UPLOADED_PHOTO_PATH =
  /^\/users\/[0-9a-f]{24}\/portfolio\/[0-9a-f-]{36}\.jpg$/i

/**
 * Whether a saved portfolio entry is a photo the worker uploaded (BE-120),
 * as opposed to a link to another host from before uploads existed. Only for
 * how the form shows the entry: the API decides what other people see, and
 * it never shows them a link to another host.
 *
 * An inline `data:image/` (stories and tests; the API never saves one) is
 * drawn as a photo too: it asks no other host for anything.
 */
export function isUploadedPortfolioPhoto(value: string): boolean {
  try {
    const url = new URL(value.trim())
    if (url.protocol === 'data:') return url.pathname.startsWith('image/')
    if (url.protocol !== 'https:') return false
    return (
      MEDIA_HOSTS.includes(url.hostname) ||
      UPLOADED_PHOTO_PATH.test(url.pathname)
    )
  } catch {
    return false
  }
}

/** Longest link the API takes (INVALID_PORTFOLIO_URL above it). */
export const PORTFOLIO_URL_MAX_LENGTH = 2048

export type PortfolioUrlProblem = 'notHttps' | 'tooLong'

/**
 * Why a portfolio link would be refused, or null when it is fine. https only:
 * an http image is blocked or flagged on an https page, and the API refuses
 * it too.
 */
export function portfolioUrlProblem(value: string): PortfolioUrlProblem | null {
  const url = value.trim()
  if (url.length > PORTFOLIO_URL_MAX_LENGTH) return 'tooLong'
  try {
    return new URL(url).protocol === 'https:' ? null : 'notHttps'
  } catch {
    return 'notHttps'
  }
}
