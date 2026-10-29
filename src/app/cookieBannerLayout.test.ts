import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  COOKIE_BANNER_HEIGHT_VAR,
  COOKIE_BANNER_OPEN_ATTR,
  COOKIE_BANNER_SCROLL_PADDING,
} from './cookieBannerLayout'

describe('the cookie banner and the bottom of the screen', () => {
  const globals = readFileSync(
    join(process.cwd(), 'src/app/globals.css'),
    'utf8',
  )

  it('leaves room for the open banner under every scroll to a control', () => {
    expect(globals).toContain(
      `scroll-padding-bottom: ${COOKIE_BANNER_SCROLL_PADDING};`,
    )
  })

  it('is 0 with the banner closed and its height plus 16px when open', () => {
    expect(COOKIE_BANNER_SCROLL_PADDING).toBe(
      `calc(var(${COOKIE_BANNER_HEIGHT_VAR}, -16px) + 16px)`,
    )
  })

  it('marks <html> while it is open, for the floating pill to wait on', () => {
    expect(COOKIE_BANNER_OPEN_ATTR).toBe('data-cookie-banner-open')
    const banner = readFileSync(
      join(process.cwd(), 'src/app/CookieConsentBanner.tsx'),
      'utf8',
    )
    // Set with the height variable, and taken away with it when it closes.
    expect(banner).toContain('root.setAttribute(COOKIE_BANNER_OPEN_ATTR')
    expect(banner).toContain('root.removeAttribute(COOKIE_BANNER_OPEN_ATTR')
    const pill = readFileSync(
      join(
        process.cwd(),
        'src/app/(marketing)/components/ui/landing/sections/FloatingPostPill.tsx',
      ),
      'utf8',
    )
    expect(pill).toContain('COOKIE_BANNER_OPEN_ATTR')
  })

  it('keeps focus clear of the floating pill while it is shown, banner closed', () => {
    expect(globals).toContain('html:not([data-cookie-banner-open]):has(')
    expect(globals).toContain('[data-floating-post-pill][data-visible="true"]')
    expect(globals).toContain(
      'scroll-padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 76px);',
    )
  })
})
