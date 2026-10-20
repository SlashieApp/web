import { describe, expect, it } from 'vitest'

import { APPLE_NONCE_BYTES, createAppleNonce, sha256Hex } from './appleNonce'

describe('sha256Hex', () => {
  it('hashes to lowercase hex', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })
})

describe('createAppleNonce', () => {
  it('makes a 32-byte hex raw nonce and sends Apple its SHA-256', async () => {
    const nonce = await createAppleNonce()
    expect(nonce.raw).toMatch(
      new RegExp(`^[0-9a-f]{${APPLE_NONCE_BYTES * 2}}$`),
    )
    expect(nonce.hashed).toBe(await sha256Hex(nonce.raw))
    expect(nonce.hashed).not.toBe(nonce.raw)
  })

  it('makes a new nonce every time', async () => {
    const [a, b] = await Promise.all([createAppleNonce(), createAppleNonce()])
    expect(a.raw).not.toBe(b.raw)
  })
})
