'use client'

import { useMutation } from '@apollo/client/react'
import type {
  CreateWorkerBillingPortalMutation,
  CreateWorkerSubscriptionCheckoutMutation,
} from '@codegen/schema'
import { useCallback, useState } from 'react'

import CreateWorkerBillingPortal from '@/app/(dashboard)/billing/graphql/CreateWorkerBillingPortal.gql'
import CreateWorkerSubscriptionCheckout from '@/app/(dashboard)/billing/graphql/CreateWorkerSubscriptionCheckout.gql'
import { useLocale } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'

import bag from '../i11n.json'
import { billingReturnUrl } from './billingUrls'

export type BillingCheckoutSource =
  | 'billing'
  | 'pricing'
  | 'task_quote'
  | 'account'

type UseBillingActionsResult = {
  startCheckout: (source?: BillingCheckoutSource) => Promise<void>
  openBillingPortal: () => Promise<void>
  checkoutLoading: boolean
  portalLoading: boolean
}

/**
 * Hosted Stripe Checkout and the billing portal. Both redirect away; on
 * failure the button comes back and a toast says to try again.
 */
export function useBillingActions(): UseBillingActionsResult {
  const t = useI11n(bag).toasts
  const locale = useLocale()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const [createCheckout] =
    useMutation<CreateWorkerSubscriptionCheckoutMutation>(
      CreateWorkerSubscriptionCheckout,
    )
  const [createPortal] = useMutation<CreateWorkerBillingPortalMutation>(
    CreateWorkerBillingPortal,
  )

  const startCheckout = useCallback(
    async (source: BillingCheckoutSource = 'billing') => {
      if (checkoutLoading) return
      setCheckoutLoading(true)
      try {
        capture(EVENTS.checkout_start, { source })
        const origin = window.location.origin
        const result = await createCheckout({
          variables: {
            successUrl: billingReturnUrl(origin, locale, 'success'),
            cancelUrl: billingReturnUrl(origin, locale, 'cancelled'),
          },
        })
        const url = result.data?.createWorkerSubscriptionCheckout?.url?.trim()
        if (!url) throw new Error('No checkout URL')
        window.location.href = url
      } catch {
        setCheckoutLoading(false)
        showAppToast({
          title: t.checkoutFailedTitle,
          description: t.tryAgainShortly,
          type: 'error',
        })
      }
    },
    [checkoutLoading, createCheckout, locale, t],
  )

  const openBillingPortal = useCallback(async () => {
    if (portalLoading) return
    setPortalLoading(true)
    try {
      capture(EVENTS.billing_portal_open, { source: 'billing' })
      const result = await createPortal({
        variables: {
          returnUrl: billingReturnUrl(window.location.origin, locale),
        },
      })
      const url = result.data?.createWorkerBillingPortal?.url?.trim()
      if (!url) throw new Error('No portal URL')
      window.location.href = url
    } catch {
      setPortalLoading(false)
      showAppToast({
        title: t.portalFailedTitle,
        description: t.tryAgainShortly,
        type: 'error',
      })
    }
  }, [createPortal, locale, portalLoading, t])

  return {
    startCheckout,
    openBillingPortal,
    checkoutLoading,
    portalLoading,
  }
}
