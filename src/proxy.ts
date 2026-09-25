import { type NextRequest, NextResponse } from 'next/server'

import {
  fetchWorkerProfileUserId,
  matchLegacyPublicProfile,
  profileRedirectPath,
} from '@/app/helpers/legacyProfileRedirect'
import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
} from '@/i18n/locales'
import { APP_HOME, MARKETING_HOME } from '@/utils/appRoutes'
import { AUTH_COOKIE_NAME } from '@/utils/authCookie'

const PUBLIC_FILE = /\.[^/]+$/

/** Same host as next.config PostHog reverse-proxy rewrites. */
const POSTHOG_PROXY_HOST = 'e.slashie.app'
/** Public site origin used by metadataBase / OG URLs. */
const CANONICAL_HOST = 'slashie.app'
const WWW_HOST = 'www.slashie.app'

function hostnameOf(request: NextRequest): string {
  return (
    request.headers.get('host')?.split(':')[0]?.toLowerCase() ??
    request.nextUrl.hostname.toLowerCase()
  )
}

function shouldSkip(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/api')) return true
  if (pathname === '/favicon.ico') return true
  if (pathname === '/manifest.json') return true
  if (pathname === '/robots.txt') return true
  if (pathname === '/sitemap.xml') return true
  if (PUBLIC_FILE.test(pathname)) return true
  return false
}

function hasAuthCookie(request: NextRequest): boolean {
  const value = request.cookies.get(AUTH_COOKIE_NAME)?.value?.trim()
  return Boolean(value)
}

/** Auth-aware entry destination (bare path, no locale slug). */
function entryDestination(
  request: NextRequest,
): typeof APP_HOME | typeof MARKETING_HOME {
  return hasAuthCookie(request) ? APP_HOME : MARKETING_HOME
}

function applyLocale(response: NextResponse, locale: AppLocale): NextResponse {
  response.headers.set(LOCALE_HEADER, locale)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

/**
 * 301 `/user/[id]` (already a user id) and `/workers/[workerId]` (document id
 * mapped through `workerProfileRedirect`) onto `/profile/[userId]`.
 * A failed worker lookup falls through so the page can 404 or retry.
 */
async function redirectLegacyWorker(
  request: NextRequest,
  workerId: string,
  localePrefix: '' | '/zh-hk',
): Promise<NextResponse> {
  const lookup = await fetchWorkerProfileUserId(workerId)
  if (lookup.status !== 'ok') return localeProxy(request)
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = profileRedirectPath(lookup.userId, localePrefix)
  return NextResponse.redirect(redirectUrl, 301)
}

/**
 * Locale slug routing (Next.js `proxy` — formerly `middleware`):
 * - Default locale (`en`) is unprefixed: `/search`, `/home`, …
 * - Non-default (`zh-hk`) keeps `/zh-hk/...` and rewrites to the bare path.
 * - Explicit `/en` and `/en/...` permanently redirect to the unprefixed path.
 * - `/` and `/zh-hk` are auth-aware: signed-in → `/search`, guest → `/home`.
 * - Legacy public profiles 301 to `/profile/[userId]`.
 */
export function proxy(
  request: NextRequest,
): NextResponse | Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const host = hostnameOf(request)

  // First-party PostHog ingest host: never locale-prefix or redirect.
  // Rewrites in next.config.ts handle /static, /array, and capture paths.
  if (host === POSTHOG_PROXY_HOST) {
    return NextResponse.next()
  }

  // One public origin: www is a permanent alias of the apex.
  if (host === WWW_HOST) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.hostname = CANONICAL_HOST
    redirectUrl.protocol = 'https:'
    return NextResponse.redirect(redirectUrl, 308)
  }

  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  const legacy = matchLegacyPublicProfile(pathname)
  if (legacy?.kind === 'user') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = profileRedirectPath(legacy.id, legacy.localePrefix)
    return NextResponse.redirect(redirectUrl, 301)
  }
  if (legacy?.kind === 'worker') {
    return redirectLegacyWorker(request, legacy.id, legacy.localePrefix)
  }

  return localeProxy(request)
}

function localeProxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/')
  const maybeLocale = segments[1]

  if (isAppLocale(maybeLocale)) {
    const restSegments = segments.slice(2)
    const restPath =
      restSegments.length === 0 ? '/' : `/${restSegments.join('/')}`

    // Explicit `/en` / `/en/...` → permanent redirect to unprefixed path.
    // `/` then applies the auth-aware entry redirect.
    if (maybeLocale === DEFAULT_LOCALE) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = restPath
      return NextResponse.redirect(redirectUrl, 308)
    }

    // Locale root `/zh-hk` → auth-aware entry under that locale.
    if (restPath === '/') {
      const dest = entryDestination(request)
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${maybeLocale}${dest}`
      return NextResponse.redirect(redirectUrl)
    }

    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = restPath

    const response = NextResponse.rewrite(rewriteUrl)
    return applyLocale(response, maybeLocale)
  }

  // Bare `/` → auth-aware English entry (preserve query string).
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = entryDestination(request)
    return NextResponse.redirect(redirectUrl)
  }

  // Unprefixed English path — set locale and continue (no redirect to `/en`).
  const response = NextResponse.next()
  return applyLocale(response, DEFAULT_LOCALE)
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static assets handled in shouldSkip.
     * Still run for `/` and all app routes.
     */
    '/((?!_next/static|_next/image).*)',
  ],
}
