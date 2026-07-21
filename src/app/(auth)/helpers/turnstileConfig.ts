/** Cloudflare Turnstile site key (public). Secret stays on the API. */
export function getTurnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? ''
}

/** When unset (typical local/dev), CAPTCHA UI and token sending are skipped. */
export function isTurnstileConfigured(): boolean {
  return getTurnstileSiteKey().length > 0
}

/** Client-side fail count before login/register show CAPTCHA (server remains source of truth for lockout). */
export const AUTH_CAPTCHA_FAIL_THRESHOLD = 3

/**
 * Temporary bridge until GraphQL accepts `captchaToken` args.
 * BE should read this header and/or the future mutation field.
 */
export const AUTH_CAPTCHA_HEADER = 'x-captcha-token'

export const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
