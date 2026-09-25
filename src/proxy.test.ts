import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LOCALE_COOKIE, LOCALE_HEADER } from '@/i18n/locales'
import { proxy } from '@/proxy'
import { AUTH_COOKIE_NAME } from '@/utils/authCookie'

function request(
  path: string,
  opts?: { cookie?: string; host?: string },
): NextRequest {
  const host = opts?.host ?? 'slashie.app'
  const url = new URL(path, `https://${host}`)
  const headers = new Headers()
  headers.set('host', host)
  if (opts?.cookie) headers.set('cookie', opts.cookie)
  return new NextRequest(url, { headers })
}

describe('proxy locale routing', async () => {
  it('redirects guest / to /home and preserves query', async () => {
    const res = await proxy(request('/?utm=1'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://slashie.app/home?utm=1')
  })

  it('redirects signed-in / to /search', async () => {
    const res = await proxy(
      request('/', { cookie: `${AUTH_COOKIE_NAME}=token` }),
    )
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://slashie.app/search')
  })

  it('redirects /zh-hk guest to /zh-hk/home and signed-in to /zh-hk/search', async () => {
    const guest = await proxy(request('/zh-hk'))
    expect(guest.headers.get('location')).toBe('https://slashie.app/zh-hk/home')

    const authed = await proxy(
      request('/zh-hk', { cookie: `${AUTH_COOKIE_NAME}=token` }),
    )
    expect(authed.headers.get('location')).toBe(
      'https://slashie.app/zh-hk/search',
    )
  })

  it('308-redirects /en/... to unprefixed paths', async () => {
    const res = await proxy(request('/en/pricing?x=1'))
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://slashie.app/pricing?x=1')

    const root = await proxy(request('/en'))
    expect(root.status).toBe(308)
    expect(root.headers.get('location')).toBe('https://slashie.app/')
  })

  it('serves bare English paths with en locale (no redirect)', async () => {
    const res = await proxy(request('/search'))
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBe('en')
    expect(res.headers.get('set-cookie') ?? '').toContain(`${LOCALE_COOKIE}=en`)
  })

  it('rewrites /zh-hk/... and sets zh-hk locale', async () => {
    const res = await proxy(request('/zh-hk/pricing'))
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBe('zh-hk')
    // rewrite: x-middleware-rewrite
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).toContain('/pricing')
  })

  it('308-redirects www to the canonical apex host', async () => {
    const res = await proxy(
      request('/search?mode=tasks', { host: 'www.slashie.app' }),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe(
      'https://slashie.app/search?mode=tasks',
    )
  })

  it('does not force localhost onto the public origin', async () => {
    const res = await proxy(request('/search', { host: 'localhost' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('skips PostHog proxy host', async () => {
    const res = await proxy(request('/e/', { host: 'e.slashie.app' }))
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBeNull()
  })

  it('skips /api auth mobile-redirect (no locale cookie rewrite)', async () => {
    const res = await proxy(
      request('/api/auth/mobile-redirect?code=test&state=abc'),
    )
    expect(res.status).toBe(200)
    expect(res.headers.get(LOCALE_HEADER)).toBeNull()
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('301s /user/[id] to /profile/[id] and keeps the query', async () => {
    const res = await proxy(request('/user/abc?excludeTaskId=task%202'))
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(
      'https://slashie.app/profile/abc?excludeTaskId=task%202',
    )
  })

  it('301s /zh-hk/user/[id] under the locale prefix', async () => {
    const res = await proxy(request('/zh-hk/user/abc'))
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(
      'https://slashie.app/zh-hk/profile/abc',
    )
  })

  it('301s /workers/[workerId] after workerProfileRedirect', async () => {
    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', 'https://apollo.example')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { workerProfileRedirect: { userId: 'user-9' } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const res = await proxy(request('/workers/worker-1?fromTask=task-1'))
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(
      'https://slashie.app/profile/user-9?fromTask=task-1',
    )
    expect(fetchMock).toHaveBeenCalled()
  })

  it('404s /workers/[workerId] when the document id does not resolve', async () => {
    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', 'https://apollo.example')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { workerProfileRedirect: null } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const res = await proxy(request('/workers/missing-worker'))
    expect(res.status).toBe(404)
    expect(res.headers.get('location')).toBeNull()
  })

  it('leaves the workers directory in place', async () => {
    const res = await proxy(request('/workers'))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})

afterEach(async () => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})
