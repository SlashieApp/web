/** The Expo app's Android package and link scheme (expo `app.config.ts`). */
const ANDROID_PACKAGE = 'app.slashie.mobile'
const APP_SCHEME = 'slashie'

/**
 * Android link that opens the Slashie app when it's installed; when it
 * isn't, the browser loads `fallbackUrl` itself, with no error page. iPhone
 * has no equivalent until universal links ship.
 */
export function androidAppIntentUrl(fallbackUrl: string): string {
  return `intent://#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
}

export function isAndroidBrowser(userAgent: string): boolean {
  return /\bAndroid\b/i.test(userAgent)
}

/**
 * Click handler for an "Open in app" link to the web app: on Android it tries
 * the Slashie app first; elsewhere the link opens the web app as usual. A
 * browser that ignores intent links still reaches the web app after 1.5 s.
 */
export function openAppOnAndroid(event: {
  currentTarget: HTMLAnchorElement
  preventDefault: () => void
}) {
  if (!isAndroidBrowser(navigator.userAgent)) return
  event.preventDefault()
  const webUrl = event.currentTarget.href
  window.location.href = androidAppIntentUrl(webUrl)
  const timer = window.setTimeout(() => {
    if (document.visibilityState === 'visible') window.location.href = webUrl
  }, 1500)
  document.addEventListener('visibilitychange', () => clearTimeout(timer), {
    once: true,
  })
}
