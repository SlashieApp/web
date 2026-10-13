import { describe, expect, it } from 'vitest'

import { publishOnce } from './publishOnce'

describe('publishOnce', () => {
  it('ignores a second tap while the first publish is running', async () => {
    const lock = { current: false }
    let calls = 0
    let finish: (value: boolean) => void = () => {}
    const publish = () => {
      calls += 1
      return new Promise<boolean>((resolve) => {
        finish = resolve
      })
    }

    const first = publishOnce(lock, publish)
    await publishOnce(lock, publish)
    finish(true)
    await first

    expect(calls).toBe(1)
  })

  it('stays locked after a successful publish', async () => {
    const lock = { current: false }
    let calls = 0
    const publish = async () => {
      calls += 1
      return true
    }

    await publishOnce(lock, publish)
    await publishOnce(lock, publish)

    expect(calls).toBe(1)
    expect(lock.current).toBe(true)
  })

  it('lets the poster retry after a failure or an error', async () => {
    const lock = { current: false }
    await publishOnce(lock, async () => false)
    expect(lock.current).toBe(false)

    await expect(
      publishOnce(lock, async () => {
        throw new Error('network')
      }),
    ).rejects.toThrow('network')
    expect(lock.current).toBe(false)
  })
})
