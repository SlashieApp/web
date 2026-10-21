import { describe, expect, it } from 'vitest'

import { duringTokenSwap, isReplacedSession } from './auth'

describe('duringTokenSwap (BE-102)', () => {
  it('treats a refusal as a replaced session only while the password change runs', async () => {
    expect(isReplacedSession('Bearer old')).toBe(false)
    let during = false
    const result = await duringTokenSwap(async () => {
      during = isReplacedSession('Bearer old')
      return 'done'
    })
    expect(result).toBe('done')
    expect(during).toBe(true)
    expect(isReplacedSession('Bearer old')).toBe(false)
  })

  it('stops guarding when the change fails', async () => {
    await expect(
      duringTokenSwap(async () => {
        throw new Error('INVALID_CREDENTIALS')
      }),
    ).rejects.toThrow('INVALID_CREDENTIALS')
    expect(isReplacedSession('Bearer old')).toBe(false)
  })
})
