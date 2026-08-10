import { NextResponse } from 'next/server'

import { buildMobileRedirectHtml } from './mobileRedirect'

/**
 * GET /api/auth/mobile-redirect
 *
 * Pure redirect bridge for Expo Google OAuth. Does not create sessions or
 * set Slashie auth cookies. Whitelisted in Google Cloud Console as:
 *   https://slashie.app/api/auth/mobile-redirect
 * (also add www if that host is live without apex rewrite)
 */
export function GET(request: Request): NextResponse {
  const { search } = new URL(request.url)
  const html = buildMobileRedirectHtml(search)

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      // Explicitly avoid accidental cookie/session side effects on this bridge.
      'Referrer-Policy': 'no-referrer',
    },
  })
}
