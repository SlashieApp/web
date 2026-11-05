import { afterEach, describe, expect, it, vi } from 'vitest'

import { absoluteUrlFromEnv } from './absoluteUrl'

describe('absoluteUrlFromEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns a full URL as it is', () => {
    expect(absoluteUrlFromEnv('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    )
  })

  it('puts a path on the app URL, without a doubled slash', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://slashie.app/')
    expect(absoluteUrlFromEnv('/tasks/1')).toBe('https://slashie.app/tasks/1')
    expect(absoluteUrlFromEnv('tasks/1')).toBe('https://slashie.app/tasks/1')
  })

  it('falls back to the Vercel deployment, then to the path itself', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '')
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app')
    expect(absoluteUrlFromEnv('/tasks/1')).toBe(
      'https://preview.vercel.app/tasks/1',
    )
    vi.stubEnv('VERCEL_URL', '')
    expect(absoluteUrlFromEnv('/tasks/1')).toBe('/tasks/1')
  })
})
