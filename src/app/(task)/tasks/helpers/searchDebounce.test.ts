import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SEARCH_DEBOUNCE_MS, createDebouncer } from './searchDebounce'

describe('createDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits 300 ms for the search to settle', () => {
    expect(SEARCH_DEBOUNCE_MS).toBe(300)
  })

  it('runs the call once the delay has passed, and only once', () => {
    const run = vi.fn()
    const debouncer = createDebouncer(300)
    debouncer.schedule(run)

    vi.advanceTimersByTime(299)
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('starts over on each keystroke, so only the last call runs', () => {
    const first = vi.fn()
    const second = vi.fn()
    const debouncer = createDebouncer(300)
    debouncer.schedule(first)
    vi.advanceTimersByTime(200)
    debouncer.schedule(second)

    // 400 ms in: the first call's delay is over, the second's is not.
    vi.advanceTimersByTime(200)
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('drops the waiting call when cancelled (Enter, a chip, Clear)', () => {
    const run = vi.fn()
    const debouncer = createDebouncer(300)
    debouncer.schedule(run)
    debouncer.cancel()

    vi.advanceTimersByTime(1000)
    expect(run).not.toHaveBeenCalled()
  })

  it('cancels safely with nothing waiting, and works again after a run', () => {
    const run = vi.fn()
    const debouncer = createDebouncer(300)
    expect(() => debouncer.cancel()).not.toThrow()

    debouncer.schedule(run)
    vi.advanceTimersByTime(300)
    debouncer.schedule(run)
    vi.advanceTimersByTime(300)
    expect(run).toHaveBeenCalledTimes(2)
  })
})
