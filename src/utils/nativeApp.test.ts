import { describe, expect, it } from 'vitest'

import { androidAppIntentUrl, isAndroidBrowser, isMobileOs } from './nativeApp'

describe('androidAppIntentUrl', () => {
  it('opens the Slashie app and falls back to the given web page', () => {
    expect(androidAppIntentUrl('https://slashie.app/search')).toBe(
      'intent://#Intent;scheme=slashie;package=app.slashie.mobile;S.browser_fallback_url=https%3A%2F%2Fslashie.app%2Fsearch;end',
    )
  })
})

describe('isAndroidBrowser', () => {
  it('spots Android and leaves iPhone and desktop alone', () => {
    expect(
      isAndroidBrowser(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36',
      ),
    ).toBe(true)
    expect(
      isAndroidBrowser(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false)
    expect(
      isAndroidBrowser(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/129.0 Safari/537.36',
      ),
    ).toBe(false)
  })
})

describe('isMobileOs', () => {
  it('counts Android, iPhone and iPad (including iPadOS as a touch Mac)', () => {
    expect(isMobileOs('Mozilla/5.0 (Linux; Android 14; Pixel 8)', 5)).toBe(true)
    expect(isMobileOs('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', 5)).toBe(true)
    expect(
      isMobileOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5),
    ).toBe(true)
  })

  it('treats a desktop browser as a PC', () => {
    expect(
      isMobileOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0),
    ).toBe(false)
    expect(isMobileOs('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0)).toBe(
      false,
    )
  })
})
