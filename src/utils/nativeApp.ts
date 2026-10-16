/** The Expo app's Android package and link scheme (expo `app.config.ts`). */
const ANDROID_PACKAGE = 'app.slashie.mobile'
const APP_SCHEME = 'slashie'

/** How long a page that is still showing means the app didn't open. */
const APP_OPEN_WAIT_MS = 2000

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

/** Phones and tablets that can run the app: Android, iPhone, iPad (iPadOS reports as a Mac with touch). */
export function isMobileOs(userAgent: string, maxTouchPoints: number): boolean {
  if (/Android|iPhone|iPad|iPod/i.test(userAgent)) return true
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1
}

/**
 * Tries the Slashie app on a phone or tablet. Android uses an intent link
 * whose fallback stays on this page (a `#get-app` jump, no reload); iOS opens
 * the `slashie://` scheme (Safari asks first, and shows an error when the app
 * isn't installed). If the page is still showing after 2 s, `onUnavailable`
 * runs.
 */
export function tryOpenApp(onUnavailable: () => void) {
  const here = window.location.href.split('#')[0]
  window.location.href = isAndroidBrowser(navigator.userAgent)
    ? androidAppIntentUrl(`${here}#get-app`)
    : `${APP_SCHEME}://`
  const timer = window.setTimeout(() => {
    if (document.visibilityState !== 'visible') return
    if (window.location.hash === '#get-app') {
      window.history.replaceState(window.history.state, '', here)
    }
    onUnavailable()
  }, APP_OPEN_WAIT_MS)
  document.addEventListener('visibilitychange', () => clearTimeout(timer), {
    once: true,
  })
}
