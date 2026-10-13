import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getCookieConsent,
  onCookieConsentChange,
  onCookieSettingsOpen,
  openCookieSettings,
  setCookieConsent,
} from './consent'

function stubBrowser() {
  const store = new Map<string, string>()
  const target = new EventTarget()
  vi.stubGlobal('window', {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cookie consent', () => {
  it('stores a changed choice and tells listeners (withdrawal)', () => {
    stubBrowser()
    const seen: string[] = []
    const stop = onCookieConsentChange((value) => seen.push(value))
    setCookieConsent('accepted')
    setCookieConsent('rejected')
    stop()
    expect(getCookieConsent()).toBe('rejected')
    expect(seen).toEqual(['accepted', 'rejected'])
  })

  it('reopens the banner from Cookie settings until unsubscribed', () => {
    stubBrowser()
    const open = vi.fn()
    const stop = onCookieSettingsOpen(open)
    openCookieSettings()
    stop()
    openCookieSettings()
    expect(open).toHaveBeenCalledTimes(1)
  })
})
