/** Campaign tags are the only query params analytics may keep. */
const KEEP_PARAM = /^utm_/i
/** Event properties that hold a URL (`$current_url`, `$referrer`, `url_or_operation`, ...). */
const URL_KEY = /url|referrer|href/i
const ABSOLUTE_URL = /^https?:\/\//i

/**
 * Drops the query string (except `utm_*`) and the hash from a URL, so
 * reset and verification tokens, emails and presigned upload signatures
 * never reach analytics.
 */
export function scrubAnalyticsUrl(value: string): string {
  try {
    const url = new URL(value)
    const kept = new URLSearchParams()
    url.searchParams.forEach((paramValue, key) => {
      if (KEEP_PARAM.test(key)) kept.append(key, paramValue)
    })
    const query = kept.toString()
    return `${url.origin}${url.pathname}${query ? `?${query}` : ''}`
  } catch {
    return value
  }
}

type PropertyBag = Record<string, unknown>

/** PostHog `before_send`: scrub every URL-looking property in place. */
export function scrubEventUrls<
  T extends {
    properties?: PropertyBag
    $set?: PropertyBag
    $set_once?: PropertyBag
  },
>(event: T | null): T | null {
  if (!event) return event
  for (const bag of [event.properties, event.$set, event.$set_once]) {
    if (!bag) continue
    for (const [key, value] of Object.entries(bag)) {
      if (
        typeof value === 'string' &&
        URL_KEY.test(key) &&
        ABSOLUTE_URL.test(value)
      ) {
        bag[key] = scrubAnalyticsUrl(value)
      }
    }
  }
  return event
}
