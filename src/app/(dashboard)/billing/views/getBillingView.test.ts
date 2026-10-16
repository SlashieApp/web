import { WorkerSubscriptionStatus } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import {
  BILLING_VIEWS,
  type BillingView,
  type BillingViewInput,
  getBillingView,
} from '.'

type Membership = NonNullable<BillingViewInput['worker']>['membership']

const free: Membership = {
  hasUnlimitedQuotes: false,
  canUpgrade: true,
  canStartTrial: true,
  cancelAtPeriodEnd: false,
  subscriptionStatus: WorkerSubscriptionStatus.None,
}
const seen = new Set<BillingView>()
const view = (
  membership: Partial<Membership> = {},
  rest: Partial<Omit<BillingViewInput, 'worker'>> & {
    setupComplete?: boolean
  } = {},
) => {
  const { setupComplete = true, ...input } = rest
  const result = getBillingView({
    worker: { setupComplete, membership: { ...free, ...membership } },
    pricing: 'ready',
    checkout: null,
    ...input,
  })
  seen.add(result)
  return result
}
const unlimited = (status: WorkerSubscriptionStatus) => ({
  hasUnlimitedQuotes: true,
  canUpgrade: false,
  canStartTrial: false,
  subscriptionStatus: status,
})

describe('getBillingView', () => {
  it('tells a customer plans are for workers', () => {
    const result = getBillingView({
      worker: null,
      pricing: 'ready',
      checkout: null,
    })
    seen.add(result)
    expect(result).toBe('customer')
  })

  it('asks a worker with unfinished setup to finish it first', () => {
    expect(view({}, { setupComplete: false })).toBe('workerSetup')
  })

  it('offers the free trial on the free plan', () => {
    expect(view()).toBe('free')
  })

  it('offers Resubscribe, without a trial, after a subscription ended', () => {
    expect(
      view({
        canStartTrial: false,
        subscriptionStatus: WorkerSubscriptionStatus.Canceled,
      }),
    ).toBe('lapsed')
  })

  it('holds the offer while the price loads, and retries if it fails', () => {
    expect(view({}, { pricing: 'loading' })).toBe('loading')
    expect(view({}, { pricing: 'failed' })).toBe('priceUnavailable')
  })

  it('shows the trial, a paid plan, and one that is ending', () => {
    expect(view(unlimited(WorkerSubscriptionStatus.Trialing))).toBe('trialing')
    expect(view(unlimited(WorkerSubscriptionStatus.Active))).toBe('subscribed')
    expect(
      view({
        ...unlimited(WorkerSubscriptionStatus.Active),
        cancelAtPeriodEnd: true,
      }),
    ).toBe('cancelling')
  })

  it('asks to fix payment when it is past due or unpaid (no quota meter)', () => {
    expect(view({ subscriptionStatus: WorkerSubscriptionStatus.PastDue })).toBe(
      'paymentProblem',
    )
    expect(view({ subscriptionStatus: WorkerSubscriptionStatus.Unpaid })).toBe(
      'paymentProblem',
    )
    expect(BILLING_VIEWS.paymentProblem.meter).toBe(false)
  })

  it('says when the plan is paused or Checkout never finished', () => {
    expect(view({ subscriptionStatus: WorkerSubscriptionStatus.Paused })).toBe(
      'paused',
    )
    expect(
      view({ subscriptionStatus: WorkerSubscriptionStatus.Incomplete }),
    ).toBe('incomplete')
  })

  it('waits for Stripe after Checkout, with no button to start another', () => {
    expect(view({}, { checkout: 'returning' })).toBe('activating')
    expect(BILLING_VIEWS.activating.action).toBeNull()
    expect(view({}, { checkout: 'delayed' })).toBe('activationDelayed')
  })

  it('shows the plan once Stripe confirms it, even while still returning', () => {
    expect(
      view(unlimited(WorkerSubscriptionStatus.Trialing), {
        checkout: 'returning',
      }),
    ).toBe('trialing')
  })

  // Every registered view is reached by at least one test above.
  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(BILLING_VIEWS).sort())
  })
})
