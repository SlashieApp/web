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
  | 'workerTrialing'
  | 'workerUnlimited'
  | 'workerCancelling'
  | 'workerGivenUntil'
  | 'workerGiven'
  | 'workerPaymentProblem'
  | 'workerPaused'
  | 'workerIncomplete'
  | 'workerBilling'

/** Button copy key (`plans.actions`). */
export type PricingActionLabel =
  | 'becomeWorker'
  | 'startTrial'
  | 'finishSetup'
  | 'resubscribe'
  | 'manageBilling'
  | 'keepPro'
  | 'fixPayment'
  | 'checkAgain'

/** What a plan card's button does. */
export type PricingAction =
  /** Goes to a page (bare path; the link adds the locale). */
  | { kind: 'link'; label: PricingActionLabel; href: string }
  /** Starts Stripe Checkout for Slashie Pro. */
  | { kind: 'checkout'; label: PricingActionLabel }
  /** Opens the Stripe billing portal, as Billing's button does. */
  | { kind: 'portal'; label: PricingActionLabel }
  /** Asks the API to re-read the plan from Stripe, as Billing's Check again. */
  | { kind: 'sync'; label: PricingActionLabel }
  /** A placeholder while the signed-in profile loads. */
  | { kind: 'pending' }

/**
 * The paid card's big line and the line under it (FE-290). Billing's words
 * where Billing says the same thing, so the two pages agree.
 * - `trial`: "6 months free", then the price, and that a card is needed
 *   (the price alone when the API reports no trial).
 * - `price`: the price per interval.
 * - `trialing`: the price, then "Free until {date}."
 * - `ending`: "Ends {date}" (a plan that won't renew, paid or given).
 * - `given`: given by Slashie with no end date: no price.
 * - `paymentProblem`, `paused`, `notFinished`: the state, then Billing's line.
 * - `customerSoon`: as `trial`, with "Slashie Pro for customers is coming
 *   soon." in place of the card line (FE-591).
 */
export type PricingPaidLine =
  | 'trial'
  | 'customerSoon'
  | 'price'
  | 'trialing'
  | 'ending'
  | 'given'
  | 'paymentProblem'
  | 'paused'
  | 'notFinished'

export type PricingViewConfig = {
  /** False shows "Pricing isn't loading" instead of the plan cards. */
  plans: boolean
  /** The card marked "Your plan". */
  current: 'free' | 'unlimited' | null
  /** What the paid card says under its name. */
  paid: PricingPaidLine
  free: PricingAction | null
  unlimited: PricingAction | null
}
