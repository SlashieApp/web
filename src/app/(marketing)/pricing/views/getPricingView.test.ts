import { WorkerSubscriptionStatus as S } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import { PRICING_VIEWS, getPricingView } from '.'
import type { PricingView, PricingViewInput } from '.'

type Membership = NonNullable<
  NonNullable<PricingViewInput['worker']>['membership']
>

/** Flags as the API sends them for each state (FE-290: Billing's order). */
const base = {
  canManageBilling: true,
  cancelAtPeriodEnd: false,
}
const NONE: Membership = {
  ...base,
  canManageBilling: false,
  subscriptionStatus: S.None,
  hasPro: false,
  canUpgrade: true,
  canStartTrial: true,
}
const TRIALING: Membership = {
  ...base,
  subscriptionStatus: S.Trialing,
  hasPro: true,
  canUpgrade: false,
  canStartTrial: false,
}
const ACTIVE: Membership = { ...TRIALING, subscriptionStatus: S.Active }
const CANCELLING: Membership = { ...ACTIVE, cancelAtPeriodEnd: true }
/** Slashie Pro given in admin (BE-117/119): no Stripe plan. */
const GIVEN_UNTIL: Membership = {
  ...ACTIVE,
  canManageBilling: false,
  cancelAtPeriodEnd: true,
  canUpgrade: true,
}
const GIVEN: Membership = {
  ...ACTIVE,
  canManageBilling: false,
  cancelAtPeriodEnd: false,
}
const CANCELED: Membership = {
  ...NONE,
  canManageBilling: true,
  subscriptionStatus: S.Canceled,
  canStartTrial: false,
}
const PAST_DUE: Membership = {
  ...base,
  subscriptionStatus: S.PastDue,
  hasPro: false,
  canUpgrade: false,
  canStartTrial: false,
}
const UNPAID: Membership = { ...PAST_DUE, subscriptionStatus: S.Unpaid }
const PAUSED: Membership = { ...PAST_DUE, subscriptionStatus: S.Paused }
const INCOMPLETE: Membership = {
  ...PAST_DUE,
  canManageBilling: false,
  subscriptionStatus: S.Incomplete,
}
/** Can't start Checkout and nothing else applies (e.g. billing not set up). */
const STUCK: Membership = { ...NONE, canUpgrade: false }

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

  it('tells a customer Pro for them is coming soon (FE-591)', () => {
    expectView({ ...signedIn, worker: null }, 'customer')
  })

  it("holds placeholders while a worker's membership (on the account) loads", () => {
    expectView(
      { ...signedIn, worker: { setupComplete: true, membership: null } },
      'checkingSession',
    )
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

  it('shows a worker on the free trial when it ends', () => {
    expectView({ ...signedIn, worker: worker(TRIALING) }, 'workerTrialing')
  })

  it('marks Slashie Pro as the plan of a paying worker', () => {
    expectView({ ...signedIn, worker: worker(ACTIVE) }, 'workerUnlimited')
  })

  it('keeps Slashie Pro for a subscriber even if their profile is unfinished', () => {
    expectView(
      { ...signedIn, worker: worker(ACTIVE, false) },
      'workerUnlimited',
    )
  })

  it('says when a cancelled plan ends, with Keep Slashie Pro in the portal', () => {
    expectView({ ...signedIn, worker: worker(CANCELLING) }, 'workerCancelling')
  })

  it('says when Slashie Pro given until a date ends, with Keep through Checkout', () => {
    expectView({ ...signedIn, worker: worker(GIVEN_UNTIL) }, 'workerGivenUntil')
  })

  it('shows Slashie Pro given with no end, with nothing to pay or manage', () => {
    expectView({ ...signedIn, worker: worker(GIVEN) }, 'workerGiven')
  })

  it('says a payment failed, past due or unpaid, never offering a second Checkout', () => {
    expectView(
      { ...signedIn, worker: worker(PAST_DUE) },
      'workerPaymentProblem',
    )
    expectView({ ...signedIn, worker: worker(UNPAID) }, 'workerPaymentProblem')
  })

  it('says a plan is paused', () => {
    expectView({ ...signedIn, worker: worker(PAUSED) }, 'workerPaused')
  })

  it('says Checkout did not finish, with Check again', () => {
    expectView({ ...signedIn, worker: worker(INCOMPLETE) }, 'workerIncomplete')
  })

  it('sends anyone else who cannot start Checkout to Billing', () => {
    expectView({ ...signedIn, worker: worker(STUCK) }, 'workerBilling')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PRICING_VIEWS).sort())
  })
})

describe('PRICING_VIEWS', () => {
  it('only offers the trial to someone who never subscribed', () => {
    const withTrial = Object.entries(PRICING_VIEWS)
      .filter(([, config]) => config.paid === 'trial')
      .map(([view]) => view)
      .sort()
    expect(withTrial).toEqual(
      ['checkingSession', 'guest', 'workerFree', 'workerSetup'].sort(),
    )
  })

  it('tells a customer Pro is coming soon, with one Become a worker, on Pro (FE-591)', () => {
    const { customer } = PRICING_VIEWS
    expect(customer.paid).toBe('customerSoon')
    expect(customer.free).toBeNull()
    expect(customer.unlimited).toEqual({
      kind: 'link',
      label: 'becomeWorker',
      href: '/worker/setup?next=%2Fpricing',
    })
  })

  it('marks the paid plan as theirs while it is failing or paused, and Free while Checkout is unfinished', () => {
    expect(PRICING_VIEWS.workerPaymentProblem.current).toBe('unlimited')
    expect(PRICING_VIEWS.workerPaused.current).toBe('unlimited')
    expect(PRICING_VIEWS.workerIncomplete.current).toBe('free')
  })

  it('uses Billing’s actions: the portal to keep or fix, Checkout for a given plan, a re-sync to check again', () => {
    expect(PRICING_VIEWS.workerCancelling.unlimited).toEqual({
      kind: 'portal',
      label: 'keepPro',
    })
    expect(PRICING_VIEWS.workerPaymentProblem.unlimited).toEqual({
      kind: 'portal',
      label: 'fixPayment',
    })
    expect(PRICING_VIEWS.workerGivenUntil.unlimited).toEqual({
      kind: 'checkout',
      label: 'keepPro',
    })
    expect(PRICING_VIEWS.workerIncomplete.unlimited).toEqual({
      kind: 'sync',
      label: 'checkAgain',
    })
    expect(PRICING_VIEWS.workerGiven.unlimited).toBeNull()
  })

  it('the guest’s Free button says Become a worker, as it leads into worker setup', () => {
    expect(PRICING_VIEWS.guest.free).toMatchObject({ label: 'becomeWorker' })
  })

  it('brings sign-ups who want the trial back to pricing after setup', () => {
    expect(PRICING_VIEWS.guest.unlimited).toEqual({
      kind: 'link',
      label: 'startTrial',
      href: '/register?next=%2Fworker%2Fsetup%3Fnext%3D%2Fpricing',
    })
  })
})
