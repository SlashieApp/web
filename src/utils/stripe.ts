import { type Stripe, loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/** Lazy Stripe.js loader for client integrations (hosted Checkout redirect MVP). */
export function getStripe(): Promise<Stripe | null> {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  if (!key) return Promise.resolve(null)
  stripePromise ??= loadStripe(key)
  return stripePromise
}
