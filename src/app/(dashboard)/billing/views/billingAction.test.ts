import { describe, expect, it } from 'vitest'

import {
  billingActionFor,
  keepUnlimitedOpens,
  startsCheckout,
} from './billingAction'

const paid = { canManageBilling: true, canUpgrade: false }
const givenUntil = { canManageBilling: false, canUpgrade: true }
const givenForever = { canManageBilling: false, canUpgrade: false }

describe('billingActionFor (BE-119)', () => {
  it('a paid plan keeps its buttons', () => {
    expect(billingActionFor('manageBilling', paid)).toBe('manageBilling')
    expect(billingActionFor('keepUnlimited', paid)).toBe('keepUnlimited')
  })

  it('Unlimited given until a date keeps Keep, which starts Checkout', () => {
    expect(billingActionFor('keepUnlimited', givenUntil)).toBe('keepUnlimited')
    expect(keepUnlimitedOpens(givenUntil)).toBe('checkout')
    expect(keepUnlimitedOpens(paid)).toBe('portal')
  })

  it('Unlimited given with no end has no button', () => {
    expect(billingActionFor('manageBilling', givenForever)).toBeNull()
    expect(billingActionFor('keepUnlimited', givenForever)).toBeNull()
  })

  it('other actions and a missing membership pass through', () => {
    expect(billingActionFor('startTrial', givenForever)).toBe('startTrial')
    expect(billingActionFor('becomeWorker', null)).toBe('becomeWorker')
    expect(billingActionFor(null, paid)).toBeNull()
  })
})

describe('startsCheckout (FE-586: where "Have a code?" goes)', () => {
  it('Start free trial and Resubscribe, and Keep when it opens Checkout', () => {
    expect(startsCheckout('startTrial', null)).toBe(true)
    expect(startsCheckout('resubscribe', paid)).toBe(true)
    expect(startsCheckout('keepUnlimited', givenUntil)).toBe(true)
  })

  it('not the portal, setup or no button', () => {
    expect(startsCheckout('keepUnlimited', paid)).toBe(false)
    expect(startsCheckout('manageBilling', paid)).toBe(false)
    expect(startsCheckout('fixPayment', paid)).toBe(false)
    expect(startsCheckout('becomeWorker', null)).toBe(false)
    expect(startsCheckout(null, null)).toBe(false)
  })
})
