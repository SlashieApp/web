import { afterEach, describe, expect, it, vi } from 'vitest'

const ph = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
  opt_in_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
}))

vi.mock('posthog-js', () => ({ default: ph }))

function stubAcceptedBrowser() {
  const store = new Map([['slashie.cookie-consent', 'accepted']])
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  })
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN', 'phc_test')
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://ph.test')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('applyCookieConsent', () => {
  it('stops capture when consent is withdrawn and resumes on accept', async () => {
    stubAcceptedBrowser()
    const { applyCookieConsent } = await import('./posthog-client')

    applyCookieConsent('accepted')
    expect(ph.init).toHaveBeenCalledTimes(1)
    expect(ph.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({ disable_session_recording: true }),
    )

    applyCookieConsent('rejected')
    expect(ph.opt_out_capturing).toHaveBeenCalledTimes(1)

    ph.has_opted_out_capturing.mockReturnValue(true)
    applyCookieConsent('accepted')
    expect(ph.opt_in_capturing).toHaveBeenCalledTimes(1)
  })
})
