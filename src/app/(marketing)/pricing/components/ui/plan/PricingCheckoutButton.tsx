'use client'

import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { Button } from '@ui'

/**
 * Starts Stripe Checkout for Slashie Unlimited (Billing handles the return).
 * It is the paid plan's button and so the page's main action: the green
 * primary, like the paid plan's links, and it carries `data-page-green-action`
 * so the marketing header's Get started gives way to it while it is on screen
 * (one green fill per screen). The plan's plum is its label, sparkle and
 * hairline.
 */
export function PricingCheckoutButton({ label }: { label: string }) {
  const { startCheckout, checkoutLoading } = useBillingActions()

  return (
    <Button
      w="full"
      variant="primary"
      data-page-green-action=""
      onClick={() => void startCheckout('pricing')}
      loading={checkoutLoading}
      disabled={checkoutLoading}
    >
      {label}
    </Button>
  )
}
