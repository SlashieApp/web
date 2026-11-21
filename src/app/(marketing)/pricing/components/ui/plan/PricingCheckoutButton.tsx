'use client'

import { Stack } from '@chakra-ui/react'

import { PromoCodeField } from '@/app/(dashboard)/billing/components/ui/PromoCodeField'
import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { usePromoCode } from '@/app/(dashboard)/billing/helpers/usePromoCode'
import { Button } from '@ui'

/**
 * Starts Stripe Checkout for Slashie Pro (Billing handles the return).
 * It is the paid plan's button and so the page's main action: the green
 * primary, like the paid plan's links, and it carries `data-page-green-action`
 * so the marketing header's Get started gives way to it while it is on screen
 * (one green fill per screen). The plan's plum is its label, sparkle and
 * hairline. "Have a code?" sits under it (FE-586): a typed code is checked
 * before Checkout starts, and one that can't be used stays on the page.
 */
export function PricingCheckoutButton({ label }: { label: string }) {
  const { startCheckout, checkoutLoading } = useBillingActions()
  const promo = usePromoCode()

  const start = async () => {
    const promoCode = await promo.codeForCheckout()
    if (promoCode === false) return
    await startCheckout('pricing', {
      promoCode,
      onPromoProblem: promo.refuse,
    })
  }

  return (
    <Stack gap={2} w="full">
      <Button
        w="full"
        variant="primary"
        data-page-green-action=""
        onClick={() => void start()}
        loading={checkoutLoading || promo.checking}
        disabled={checkoutLoading || promo.checking}
      >
        {label}
      </Button>
      <PromoCodeField promo={promo} align="center" disabled={checkoutLoading} />
    </Stack>
  )
}
