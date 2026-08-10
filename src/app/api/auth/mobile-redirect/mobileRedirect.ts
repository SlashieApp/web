/**
 * Immich-style HTTPS → custom-scheme bridge for Expo Google OAuth.
 *
 * Google Web clients reject custom-scheme redirect URIs, so Google redirects
 * here (`https://slashie.app/api/auth/mobile-redirect`) and this page forwards
 * into the app deep link `slashie://oauth-callback` while preserving query
 * (and hash on the client, which the server never receives).
 *
 * Prefer HTML + JS over a bare 307: Android Chrome / WebView often hang on
 * HTTP redirects to custom schemes (see Immich #24409).
 */

/** Expo `app.json` scheme — deep link target for OAuth callback. */
export const MOBILE_OAUTH_CALLBACK = 'slashie://oauth-callback'

export function buildMobileDeepLink(search: string, hash = ''): string {
  const query = search.startsWith('?') ? search : search ? `?${search}` : ''
  const fragment = hash.startsWith('#') ? hash : hash ? `#${hash}` : ''
  return `${MOBILE_OAUTH_CALLBACK}${query}${fragment}`
}

/** Escape a value for use inside a double-quoted HTML attribute. */
export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * HTML bridge page: JS sets `window.location` to the deep link (query + hash
 * from the browser URL). Fallback anchor uses the server-built query href;
 * JS upgrades it when a hash is present.
 */
export function buildMobileRedirectHtml(search: string): string {
  const deepLink = buildMobileDeepLink(search)
  const hrefAttr = escapeHtmlAttr(deepLink)
  // JSON.stringify yields a JS string literal safe for embedding in <script>.
  const callbackLiteral = JSON.stringify(MOBILE_OAUTH_CALLBACK)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Opening Slashie…</title>
  <script>
    (function () {
      var qs = window.location.search || "";
      var hash = window.location.hash || "";
      var target = ${callbackLiteral} + qs + hash;
      window.location.replace(target);
    })();
  </script>
</head>
<body>
  <p>Opening Slashie…</p>
  <p>If nothing happens, <a id="slashie-open" href="${hrefAttr}">Open Slashie</a>.</p>
  <script>
    (function () {
      var qs = window.location.search || "";
      var hash = window.location.hash || "";
      var el = document.getElementById("slashie-open");
      if (el) el.href = ${callbackLiteral} + qs + hash;
    })();
  </script>
</body>
</html>`
}
