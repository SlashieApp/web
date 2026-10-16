'use client'

import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { Button } from '@ui'

/** Starts Stripe Checkout for Slashie Unlimited (Billing handles the return). */
export function PricingCheckoutButton({ label }: { label: string }) {
  const { startCheckout, checkoutLoading } = useBillingActions()

  return (
    <Button
      w="full"
      onClick={() => void startCheckout('pricing')}
      loading={checkoutLoading}
      disabled={checkoutLoading}
    >
      {label}
    </Button>
  )
}
