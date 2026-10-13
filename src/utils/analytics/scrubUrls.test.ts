import { describe, expect, it } from 'vitest'

import { scrubAnalyticsUrl, scrubEventUrls } from './scrubUrls'

describe('scrubAnalyticsUrl', () => {
  it('drops tokens, emails and hashes but keeps utm tags', () => {
    expect(
      scrubAnalyticsUrl('https://slashie.app/reset-password?token=abc123#x'),
    ).toBe('https://slashie.app/reset-password')
    expect(
      scrubAnalyticsUrl(
        'https://slashie.app/forgot-password/sent?email=a%40b.com&utm_source=mail',
      ),
    ).toBe('https://slashie.app/forgot-password/sent?utm_source=mail')
    expect(scrubAnalyticsUrl('not a url')).toBe('not a url')
  })
})

describe('scrubEventUrls', () => {
  it('scrubs URL properties, person properties and leaves the rest', () => {
    const event = scrubEventUrls({
      properties: {
        $current_url: 'https://slashie.app/verify-email?token=t',
        $referrer: 'https://mail.example/inbox?id=9',
        route: '/verify-email',
        error_code: 'TOKEN_EXPIRED',
      },
      $set_once: { $initial_current_url: 'https://slashie.app/?token=t' },
    })
    expect(event?.properties).toEqual({
      $current_url: 'https://slashie.app/verify-email',
      $referrer: 'https://mail.example/inbox',
      route: '/verify-email',
      error_code: 'TOKEN_EXPIRED',
    })
    expect(event?.$set_once).toEqual({
      $initial_current_url: 'https://slashie.app/',
    })
    expect(scrubEventUrls(null)).toBeNull()
  })
})
