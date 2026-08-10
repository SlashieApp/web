import { describe, expect, it } from 'vitest'

import {
  MOBILE_OAUTH_CALLBACK,
  buildMobileDeepLink,
  buildMobileRedirectHtml,
  escapeHtmlAttr,
} from './mobileRedirect'

describe('buildMobileDeepLink', () => {
  it('appends query string to slashie://oauth-callback', () => {
    expect(buildMobileDeepLink('?code=test&state=abc')).toBe(
      `${MOBILE_OAUTH_CALLBACK}?code=test&state=abc`,
    )
  })

  it('accepts search without leading ?', () => {
    expect(buildMobileDeepLink('code=test&state=abc')).toBe(
      `${MOBILE_OAUTH_CALLBACK}?code=test&state=abc`,
    )
  })

  it('preserves hash when provided', () => {
    expect(buildMobileDeepLink('?code=1', '#frag')).toBe(
      `${MOBILE_OAUTH_CALLBACK}?code=1#frag`,
    )
    expect(buildMobileDeepLink('?code=1', 'frag')).toBe(
      `${MOBILE_OAUTH_CALLBACK}?code=1#frag`,
    )
  })

  it('works with empty query', () => {
    expect(buildMobileDeepLink('')).toBe(MOBILE_OAUTH_CALLBACK)
  })
})

describe('escapeHtmlAttr', () => {
  it('escapes characters unsafe in double-quoted attributes', () => {
    expect(escapeHtmlAttr(`a&b"c<'>`)).toBe('a&amp;b&quot;c&lt;&#39;&gt;')
  })
})

describe('buildMobileRedirectHtml', () => {
  it('embeds deep link and Open Slashie fallback for oauth params', () => {
    const html = buildMobileRedirectHtml('?code=test&state=abc')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain(MOBILE_OAUTH_CALLBACK)
    expect(html).toContain('?code=test&amp;state=abc')
    expect(html).toContain('Open Slashie')
    expect(html).toContain('window.location.replace')
    expect(html).toContain('window.location.search')
    expect(html).toContain('window.location.hash')
  })

  it('escapes query values that could break attributes', () => {
    const html = buildMobileRedirectHtml('?x="><script>alert(1)</script>')
    expect(html).not.toContain('href="?x="><script>')
    expect(html).toContain('&quot;')
    expect(html).toContain('&lt;script&gt;')
  })
})
