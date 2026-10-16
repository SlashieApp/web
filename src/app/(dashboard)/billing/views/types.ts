import type { WorkerMembershipSnapshot } from '@/app/(dashboard)/helpers/workerMembershipHelpers'

/** Where the viewer's plan stands (README.md). */
export type BillingView =
  | 'customer'
  | 'workerSetup'
  | 'loading'
  | 'priceUnavailable'
  | 'free'
  | 'lapsed'
  | 'trialing'
  | 'subscribed'
  | 'cancelling'
  | 'paymentProblem'
  | 'paused'
  | 'incomplete'
  | 'activating'
  | 'activationDelayed'

export type BillingViewInput = {
  /** The signed-in viewer's worker profile; null for customers. */
  worker: {
    setupComplete: boolean
    membership: Pick<
      WorkerMembershipSnapshot,
      | 'hasUnlimitedQuotes'
      | 'canUpgrade'
      | 'canStartTrial'
      | 'cancelAtPeriodEnd'
      | 'subscriptionStatus'
    >
  } | null
  /** The Pricing query (price, interval, trial). */
  pricing: 'loading' | 'ready' | 'failed'
  /** Back from Checkout: still waiting for Stripe, or waited too long. */
  checkout: 'returning' | 'delayed' | null
}

/** Copy keys under `views` in ../i11n.json. */
export type BillingCardTitle =
  | 'workersOnly'
  | 'finishSetup'
  | 'free'
  | 'unlimited'

export type BillingBadge =
  | 'free'
  | 'trial'
  | 'active'
  | 'ending'
  | 'paymentProblem'
  | 'paused'
  | 'notFinished'
  | 'activating'

export type BillingAction =
  | 'becomeWorker'
  | 'finishSetup'
  | 'startTrial'
  | 'resubscribe'
  | 'manageBilling'
  | 'keepUnlimited'
  | 'fixPayment'
  | 'checkAgain'
  | 'retryPricing'

/** The price line under the body. */
export type BillingPriceLine =
  | 'trialThenPrice'
  | 'thenPrice'
  | 'price'
  | 'loading'

/** Body copy key under `views.bodies`. */
export type BillingBody =
  | 'customer'
  | 'workerSetup'
  | 'free'
  | 'priceUnavailable'
  | 'lapsed'
  | 'trialing'
  | 'subscribed'
  | 'cancelling'
  | 'paymentProblem'
  | 'paused'
  | 'incomplete'
  | 'activating'
  | 'activationDelayed'

/** The membership date the body names; `periodEnd` is when access stops. */
export type BillingDate =
  | 'canceledAt'
  | 'trialEndsAt'
  | 'currentPeriodEnd'
  | 'periodEnd'

export type BillingViewConfig = {
  title: BillingCardTitle
  body: BillingBody
  /** Fills `{date}` in the body; without one the `…NoDate` copy is used. */
  date: BillingDate | null
  badge: {
    label: BillingBadge
    tone: 'neutral' | 'success' | 'warning' | 'danger'
  } | null
  /** Shows the free quota meter (free plans only; not while payment fails). */
  meter: boolean
  price: BillingPriceLine | null
  action: BillingAction | null
  /** "Cancel anytime in Manage billing." under the button. */
  cancelAnytime: boolean
  /** A spinner while Stripe confirms the plan. */
  busy: boolean
}
