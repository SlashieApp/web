import { afterEach, describe, expect, it, vi } from 'vitest'

import { isSocialAuthConfigured } from './socialAuthConfig'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('isSocialAuthConfigured', () => {
  it('is off when neither provider has a client id', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', '')
    vi.stubEnv('NEXT_PUBLIC_APPLE_CLIENT_ID', '  ')
    expect(isSocialAuthConfigured()).toBe(false)
  })

  it('is on with Google alone', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'google-id')
    vi.stubEnv('NEXT_PUBLIC_APPLE_CLIENT_ID', '')
    expect(isSocialAuthConfigured()).toBe(true)
  })

  it('is on with Apple alone', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', '')
    vi.stubEnv('NEXT_PUBLIC_APPLE_CLIENT_ID', 'apple-id')
    expect(isSocialAuthConfigured()).toBe(true)
  })
})
