# Auth abuse hardening (web)

Slashie auth routes use Cloudflare Turnstile + API rate-limit signals to reduce
password-reset and login abuse. This note covers FE behaviour, env bypass, and
**backend / infra leftovers** that FE cannot complete alone.

## FE behaviour

| Surface | CAPTCHA |
| --- | --- |
| `/forgot-password` (+ resend) | Always, when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set |
| `/login` | After **3** client fails in the browser session, or immediately if the API returns a captcha/rate-limit signal |
| `/register` | Same progressive rule as login |

Token plumbing: the web app sends the Turnstile response as HTTP header
`x-captcha-token` on `forgotPassword` / `login` / `register` mutations
(Apollo `context.headers`). Prefer migrating to a GraphQL arg once the schema
supports it:

```graphql
# Target schema (BE)
forgotPassword(email: String!, captchaToken: String): ForgotPasswordPayload!
login(email: String!, password: String!, captchaToken: String): AuthPayload!
register(..., captchaToken: String): AuthPayload!
```

Expected structured errors (extensions.code + optional retryAfterSeconds):

- `CAPTCHA_REQUIRED` / `CAPTCHA_FAILED` / `INVALID_CAPTCHA`
- `RATE_LIMITED` / `TOO_MANY_REQUESTS` / `AUTH_RATE_LIMITED` / `LOGIN_RATE_LIMITED` /
  `PASSWORD_RESET_RATE_LIMITED` / `REGISTER_RATE_LIMITED` /
  `ACCOUNT_TEMPORARILY_LOCKED` / `LOGIN_LOCKED`

Forgot-password privacy contract is unchanged: always success for valid
requests; `cooldownSecondsRemaining` drives the FE resend countdown.

## Local / CI without CAPTCHA

Leave `NEXT_PUBLIC_TURNSTILE_SITE_KEY` empty. The widget is not rendered and
mutations run without a token. **Do not treat this as production-safe.**

## PostHog signals (prefer over foreign `$pageview`s)

Canonical events (already used):

- `login_success` / `login_fail` (`method`, `had_captcha`, `fail_count_client`, `rate_limited`)
- `register_success` / `register_fail` (same abuse props)
- `password_reset_request` / `password_reset_request_fail`
- `password_reset_success` / `password_reset_fail`
- OAuth: `google_login_*` / `apple_login_*`

Auth routes also set session property `auth_surface=true` (via
`register_for_session`) so filters can exclude low-interaction auth-only noise.

**Useful alerts / dashboards (ops):**

1. Spike in `password_reset_request` or `login_fail` (volume / rate)
2. Absolute volume of `password_reset_success` and `login_success` (real outcomes)
3. Rise in `rate_limited=true` on fail events

Avoid alerting solely on “session from IR/ID hit `/login`”.

Never send raw emails in event properties (sanitizer already strips `email`).

## Backend follow-ups (required for real security)

- Verify Turnstile tokens server-side (secret key never in web)
- Accept `captchaToken` mutation args (and/or honour `x-captcha-token`)
- IP / fingerprint rate limits on login, register, forgotPassword
- Global daily Resend (or email provider) caps for reset mail
- Constant-time forgotPassword responses (already privacy-shaped; keep timing flat)
- Invalidate prior reset tokens when a new one is issued
- Structured rate-limit / captcha errors with `retryAfterSeconds` when possible

## Infra / WAF (ops checklist)

- Cloudflare / Vercel Bot Fight Mode or WAF rules on `/login`, `/register`,
  `/forgot-password` (and GraphQL auth mutations)
- Turnstile site key + secret configured in prod; site key only in web env

Until BE verifies CAPTCHA and enforces limits, this FE work is **abuse UX +
signal quality**, not a complete security control.
