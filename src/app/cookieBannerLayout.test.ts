import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  COOKIE_BANNER_HEIGHT_VAR,
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
})
