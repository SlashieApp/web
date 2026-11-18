'use client'

import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { Button } from '@ui'

/**
 * Opens the Stripe billing portal, as Billing's Keep Slashie Pro and Fix
 * payment do (FE-290), so a worker whose plan is ending or failing can act from
 * Pricing. The paid card's button, so the page's green main action.
 */
export function PricingPortalButton({ label }: { label: string }) {
  const { openBillingPortal, portalLoading } = useBillingActions()

  return (
    <Button
      w="full"
      variant="primary"
      data-page-green-action=""
      onClick={() => void openBillingPortal()}
      loading={portalLoading}
      disabled={portalLoading}
    >
      {label}
    </Button>
  )
}
