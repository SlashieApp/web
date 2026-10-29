'use client'

import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { Button } from '@ui'

/**
 * Starts Stripe Checkout for Slashie Unlimited (Billing handles the return).
 * It is the paid plan's button, so it is plum (`premium`) like the paid plan's
 * links: the card follows the landing's teaser, and the page's one green
 * button is the marketing header's Get started.
 */
export function PricingCheckoutButton({ label }: { label: string }) {
  const { startCheckout, checkoutLoading } = useBillingActions()

  return (
    <Button
      w="full"
      variant="premium"
      onClick={() => void startCheckout('pricing')}
      loading={checkoutLoading}
      disabled={checkoutLoading}
    >
      {label}
    </Button>
  )
}
