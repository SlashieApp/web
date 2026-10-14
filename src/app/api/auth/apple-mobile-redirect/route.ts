import { NextResponse } from 'next/server'

import {
  buildAppleMobileDeepLink,
  buildAppleMobileRedirectHtml,
} from './appleMobileRedirect'

/**
 * POST /api/auth/apple-mobile-redirect
 *
 * Sign in with Apple for the Android app. Apple only returns the name and
 * email scopes with `response_mode=form_post`, so it posts here; this page
 * forwards the identity token to `slashie://oauth-callback`. Pure bridge: no
 * session, no cookies. Registered as a Return URL on the Services ID
 * (`NEXT_PUBLIC_APPLE_CLIENT_ID`).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData().catch(() => new FormData())
  const html = buildAppleMobileRedirectHtml(buildAppleMobileDeepLink(form))

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Referrer-Policy': 'no-referrer',
    },
  })
}
