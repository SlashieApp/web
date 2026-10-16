import { afterAll, describe, expect, it } from 'vitest'

import { PRICING_VIEWS, getPricingView } from '.'
import type { PricingView, PricingViewInput } from '.'

type Membership = NonNullable<PricingViewInput['worker']>['membership']

/** Flags as the API sends them for each subscription state. */
const NONE: Membership = {
  hasUnlimitedQuotes: false,
  canUpgrade: true,
  canStartTrial: true,
}
const TRIALING: Membership = {
  hasUnlimitedQuotes: true,
  canUpgrade: false,
  canStartTrial: false,
}
const CANCELED: Membership = {
  hasUnlimitedQuotes: false,
  canUpgrade: true,
  canStartTrial: false,
}
const PAST_DUE: Membership = {
  hasUnlimitedQuotes: false,
  canUpgrade: false,
  canStartTrial: false,
}

function worker(membership: Membership, setupComplete = true) {
  return { setupComplete, membership }
}

const seen = new Set<PricingView>()

function expectView(input: PricingViewInput, view: PricingView) {
  seen.add(view)
  expect(getPricingView(input)).toBe(view)
}

const signedIn = { available: true, session: 'signedIn' } as const

describe('getPricingView', () => {
  it('shows a retry when the API returns no plans, whoever is looking', () => {
    expectView(
      { ...signedIn, available: false, worker: worker(TRIALING) },
      'unavailable',
    )
  })

  it('holds placeholder buttons while a signed-in profile loads', () => {
    expectView(
      { available: true, session: 'checking', worker: null },
      'checkingSession',
    )
  })

  it('sends a signed-out visitor through sign-up', () => {
    expectView({ available: true, session: 'guest', worker: null }, 'guest')
  })

  it('asks a customer to become a worker', () => {
    expectView({ ...signedIn, worker: null }, 'customer')
  })

  it('asks a worker with an unfinished profile to finish it first', () => {
    expectView({ ...signedIn, worker: worker(NONE, false) }, 'workerSetup')
  })

  it('offers a free worker the trial through Checkout', () => {
    expectView({ ...signedIn, worker: worker(NONE) }, 'workerFree')
  })

  it('offers a worker whose subscription ended a resubscribe, without a trial', () => {
    expectView({ ...signedIn, worker: worker(CANCELED) }, 'workerLapsed')
  })

  it('marks Unlimited as the plan of a trialing or paying worker', () => {
    expectView({ ...signedIn, worker: worker(TRIALING) }, 'workerUnlimited')
  })

  it('keeps Unlimited for a subscriber even if their profile is unfinished', () => {
    expectView(
      { ...signedIn, worker: worker(TRIALING, false) },
      'workerUnlimited',
    )
  })

  it('sends a worker whose payment failed to Billing, never to a second Checkout', () => {
    expectView({ ...signedIn, worker: worker(PAST_DUE) }, 'workerBilling')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PRICING_VIEWS).sort())
  })
})

describe('PRICING_VIEWS', () => {
  it('never offers the trial to someone who has or had a subscription', () => {
    expect(PRICING_VIEWS.workerUnlimited.trial).toBe(false)
    expect(PRICING_VIEWS.workerLapsed.trial).toBe(false)
    expect(PRICING_VIEWS.workerBilling.trial).toBe(false)
  })

  it('brings sign-ups who want the trial back to pricing after setup', () => {
    expect(PRICING_VIEWS.guest.unlimited).toEqual({
      kind: 'link',
      label: 'startTrial',
      href: '/register?next=%2Fworker%2Fsetup%3Fnext%3D%2Fpricing',
    })
  })
})
