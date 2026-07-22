import { type NextRequest, NextResponse } from 'next/server'

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
} from '@/i18n/locales'

const PUBLIC_FILE = /\.[^/]+$/

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

/**
 * Locale slug routing:
 * - `/en/...` and `/zh-hk/...` rewrite to the internal app path (no prefix).
 * - Paths without a locale redirect to `/en/...` (default).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  const segments = pathname.split('/')
  const maybeLocale = segments[1]

  if (isAppLocale(maybeLocale)) {
    const restSegments = segments.slice(2)
    const restPath =
      restSegments.length === 0 ? '/' : `/${restSegments.join('/')}`

    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = restPath

    const response = NextResponse.rewrite(rewriteUrl)
    response.headers.set(LOCALE_HEADER, maybeLocale)
    response.cookies.set(LOCALE_COOKIE, maybeLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return response
  }

  // No locale slug → redirect to default `en` (keep query string).
  const locale = DEFAULT_LOCALE
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname =
    pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
  return NextResponse.redirect(redirectUrl)
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