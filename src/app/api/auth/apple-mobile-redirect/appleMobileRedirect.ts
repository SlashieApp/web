import {
  MOBILE_OAUTH_CALLBACK,
  escapeHtmlAttr,
} from '../mobile-redirect/mobileRedirect'

const JWT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
const STATE = /^[A-Za-z0-9_-]{8,128}$/
const APPLE_ERROR = /^[a-z_]{1,64}$/
/** Apple's one-time authorization code: URL-safe, never long. */
const APPLE_CODE = /^[A-Za-z0-9._-]{1,1024}$/
const NAME_MAX = 100

type FormLike = { get(name: string): FormDataEntryValue | null }

function text(form: FormLike, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Apple sends the name only on the first sign-in, as JSON in `user`. */
function appleName(raw: string): { firstName: string; lastName: string } {
  try {
    const name = (
      JSON.parse(raw) as { name?: { firstName?: unknown; lastName?: unknown } }
    )?.name
    const part = (value: unknown) =>
      typeof value === 'string' ? value.trim().slice(0, NAME_MAX) : ''
    return { firstName: part(name?.firstName), lastName: part(name?.lastName) }
  } catch {
    return { firstName: '', lastName: '' }
  }
}

/**
 * Deep link for Apple's `form_post` to the Expo app (Android Sign in with
 * Apple). Only well-formed values are passed on, and only to the fixed
 * `slashie://oauth-callback`. The one-time `code` rides along with the token
 * so the API can revoke Apple's grant on deletion; the nonce is not
 * forwarded (the app keeps the raw one).
 */
export function buildAppleMobileDeepLink(form: FormLike): string {
  const params = new URLSearchParams({ provider: 'apple' })
  const state = text(form, 'state')
  if (STATE.test(state)) params.set('state', state)

  const error = text(form, 'error')
  const idToken = text(form, 'id_token')
  if (error || !JWT.test(idToken) || idToken.length > 8192) {
    params.set('error', APPLE_ERROR.test(error) ? error : 'invalid_response')
    return `${MOBILE_OAUTH_CALLBACK}?${params}`
  }

  params.set('id_token', idToken)
  const code = text(form, 'code')
  if (APPLE_CODE.test(code)) params.set('code', code)
  const { firstName, lastName } = appleName(text(form, 'user'))
  if (firstName) params.set('first_name', firstName)
  if (lastName) params.set('last_name', lastName)
  return `${MOBILE_OAUTH_CALLBACK}?${params}`
}

/**
 * HTML that opens the deep link. A POST response has no query of its own,
 * so unlike the Google bridge the link is built on the server.
 */
export function buildAppleMobileRedirectHtml(deepLink: string): string {
  // URLSearchParams already percent-encodes `<`; this keeps the script safe regardless.
  const literal = JSON.stringify(deepLink).replace(/</g, '\\u003c')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Opening Slashie…</title>
  <script>window.location.replace(${literal});</script>
</head>
<body>
  <p>Opening Slashie…</p>
  <p>If nothing happens, <a href="${escapeHtmlAttr(deepLink)}">Open Slashie</a>.</p>
</body>
</html>`
}
