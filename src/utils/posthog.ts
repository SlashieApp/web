import posthog from 'posthog-js'

export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (typeof window !== 'undefined' && key) {
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      capture_pageview: false, // we capture manually for Next.js client nav
    })
  }
}
