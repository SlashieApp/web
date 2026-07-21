import { describe, expect, it } from 'vitest'

import {
  getAuthAbuseFriendlyMessage,
  parseAuthAbuseError,
} from './authAbuseErrors'

function gqlError(code: string, extensions?: Record<string, unknown>): unknown {
  return {
    errors: [
      {
        message: code,
        extensions: { code, ...extensions },
      },
    ],
  }
}

describe('parseAuthAbuseError', () => {
  it('detects rate limit codes and retry-after', () => {
    const signal = parseAuthAbuseError(
      gqlError('LOGIN_RATE_LIMITED', { retryAfterSeconds: 45.2 }),
    )
    expect(signal.rateLimited).toBe(true)
    expect(signal.captchaRequired).toBe(false)
    expect(signal.retryAfterSeconds).toBe(46)
  })

  it('detects captcha required / failed', () => {
    expect(
      parseAuthAbuseError(gqlError('CAPTCHA_REQUIRED')).captchaRequired,
    ).toBe(true)
    expect(parseAuthAbuseError(gqlError('INVALID_CAPTCHA')).captchaFailed).toBe(
      true,
    )
  })

  it('returns calm non-enumerating copy', () => {
    const message = getAuthAbuseFriendlyMessage(
      gqlError('RATE_LIMITED', { retryAfterSeconds: 30 }),
      'fallback',
    )
    expect(message).toContain('30 seconds')
    expect(message.toLowerCase()).not.toContain('email')
  })
})
