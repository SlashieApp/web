import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { LOCALE_COOKIE, LOCALE_HEADER } from '@/i18n/locales'
import { proxy } from '@/proxy'
import { AUTH_COOKIE_NAME } from '@/utils/authCookie'

function request(
  path: string,
  opts?: { cookie?: string; host?: string },
): NextRequest {
  const url = new URL(path, 'https://www.slashie.app')
  const headers = new Headers()
  if (opts?.host) headers.set('host', opts.host)
  if (opts?.cookie) headers.set('cookie', opts.cookie)
  return new NextRequest(url, { headers })
}

describe('proxy locale routing', () => {
  it('redirects guest / to /home and preserves query', async () => {
    const res = proxy(request('/?utm=1'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'https://www.slashie.app/home?utm=1',
    )
  })

  it('redirects signed-in / to /search', () => {
    const res = proxy(request('/', { cookie: `${AUTH_COOKIE_NAME}=token` }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://www.slashie.app/search')
  })

  it('redirects /zh-hk guest to /zh-hk/home and signed-in to /zh-hk/search', () => {
    const guest = proxy(request('/zh-hk'))
    expect(guest.headers.get('location')).toBe(
      'https://www.slashie.app/zh-hk/home',
    )

    const authed = proxy(
      request('/zh-hk', { cookie: `${AUTH_COOKIE_NAME}=token` }),
    )
    expect(authed.headers.get('location')).toBe(
      'https://www.slashie.app/zh-hk/search',
    )
  })

  it('308-redirects /en/... to unprefixed paths', () => {
    const res = proxy(request('/en/pricing?x=1'))
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe(
      'https://www.slashie.app/pricing?x=1',
    )

    const root = proxy(request('/en'))
    expect(root.status).toBe(308)
    expect(root.headers.get('location')).toBe('https://www.slashie.app/')
  })

  it('serves bare English paths with en locale (no redirect)', () => {
    const res = proxy(request('/search'))
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBe('en')
    expect(res.headers.get('set-cookie') ?? '').toContain(`${LOCALE_COOKIE}=en`)
  })

  it('rewrites /zh-hk/... and sets zh-hk locale', () => {
    const res = proxy(request('/zh-hk/pricing'))
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBe('zh-hk')
    // rewrite: x-middleware-rewrite
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).toContain('/pricing')
  })

  it('skips PostHog proxy host', () => {
    const res = proxy(request('/e/', { host: 'e.slashie.app' }))
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBeNull()
  })
})
