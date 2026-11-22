import { describe, expect, it } from 'vitest'

import { accountHasPro } from './accountPro'

describe('the account has Slashie Pro (BE-145, BE-149)', () => {
  it("is the API's own answer on the account", () => {
    expect(accountHasPro({ membership: { hasPro: true } })).toBe(true)
    expect(accountHasPro({ membership: { hasPro: false } })).toBe(false)
  })

  it('is false for a guest, an account with no membership read yet, or an unknown answer', () => {
    expect(accountHasPro(null)).toBe(false)
    expect(accountHasPro(undefined)).toBe(false)
    expect(accountHasPro({})).toBe(false)
    expect(accountHasPro({ membership: null })).toBe(false)
    expect(accountHasPro({ membership: { hasPro: null } })).toBe(false)
  })

  it('does not look at a worker record: a customer with Pro on the account has it', () => {
    const customer = { membership: { hasPro: true }, worker: null }
    expect(accountHasPro(customer)).toBe(true)
    // And a worker record alone grants nothing.
    const worker = { membership: { hasPro: false }, worker: { id: 'w1' } }
    expect(accountHasPro(worker)).toBe(false)
  })
})
