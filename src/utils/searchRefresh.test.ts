import { describe, expect, it, vi } from 'vitest'

import { onSearchRefresh, requestSearchRefresh } from './searchRefresh'

describe('search refresh', () => {
  it('delivers requests until unsubscribed', () => {
    vi.stubGlobal('window', new EventTarget())
    const listener = vi.fn()
    const off = onSearchRefresh(listener)
    requestSearchRefresh()
    off()
    requestSearchRefresh()
    expect(listener).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
