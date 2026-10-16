/**
 * Who's looking at /pricing and where they stand. `getPricingView` picks one;
 * each has a config file in this folder and a row in README.md.
 */
export type PricingView =
  | 'unavailable'
  | 'checkingSession'
  | 'guest'
  | 'customer'
  | 'workerSetup'
  | 'workerFree'
  | 'workerLapsed'
  | 'workerUnlimited'
  | 'workerBilling'

/** Button copy key (`plans.actions`). */
export type PricingActionLabel =
  | 'getStarted'
  | 'becomeWorker'
  | 'startTrial'
  | 'finishSetup'
  | 'resubscribe'
  | 'manageBilling'

/** What a plan card's button does. */
export type PricingAction =
  /** Goes to a page (bare path; the link adds the locale). */
  | { kind: 'link'; label: PricingActionLabel; href: string }
  /** Starts Stripe Checkout for Slashie Unlimited. */
  | { kind: 'checkout'; label: PricingActionLabel }
  /** A placeholder while the signed-in profile loads. */
  | { kind: 'pending' }

export type PricingViewConfig = {
  /** False shows "Pricing isn't loading" instead of the plan cards. */
  plans: boolean
  /** The card marked "Your plan". */
  current: 'free' | 'unlimited' | null
  /** The Unlimited card leads with the free trial (when the API offers one). */
  trial: boolean
  free: PricingAction | null
  unlimited: PricingAction | null
}
