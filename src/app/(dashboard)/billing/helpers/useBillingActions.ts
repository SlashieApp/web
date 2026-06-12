'use client'

import { useMutation } from '@apollo/client/react'
import type {
  CreateWorkerBillingPortalMutation,
  CreateWorkerSubscriptionCheckoutMutation,
} from '@codegen/schema'
import { useCallback, useState } from 'react'

import CreateWorkerBillingPortal from '@/app/(dashboard)/billing/graphql/CreateWorkerBillingPortal.gql'
import CreateWorkerSubscriptionCheckout from '@/app/(dashboard)/billing/graphql/CreateWorkerSubscriptionCheckout.gql'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { getStripe } from '@/utils/stripe'

import {
  billingPortalReturnUrl,
  checkoutCancelUrl,
  checkoutSuccessUrl,
} from './billingUrls'

export type BillingCheckoutSource =
  | 'billing'
  | 'pricing'
  | 'task_quote'
  | 'account'

type UseBillingActionsResult = {
  startCheckout: (source?: BillingCheckoutSource) => Promise<void>
  openBillingPortal: (returnUrl?: string) => Promise<void>
  checkoutLoading: boolean
  portalLoading: boolean
}

export function useBillingActions(): UseBillingActionsResult {
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
        await getStripe()
        capture(EVENTS.checkout_start, { source })
        const result = await createCheckout({
          variables: {
            successUrl: checkoutSuccessUrl(),
            cancelUrl: checkoutCancelUrl(),
          },
        })
        const url = result.data?.createWorkerSubscriptionCheckout?.url?.trim()
        if (!url) {
          throw new Error('Checkout could not be started. Please try again.')
        }
        window.location.href = url
      } catch (error: unknown) {
        setCheckoutLoading(false)
        showAppToast({
          title: 'Could not start checkout',
          description: getFriendlyErrorMessage(
            error,
            'Checkout is unavailable right now. Try again shortly.',
          ),
          type: 'error',
        })
      }
    },
    [checkoutLoading, createCheckout],
  )

  const openBillingPortal = useCallback(
    async (returnUrl?: string) => {
      if (portalLoading) return
      setPortalLoading(true)
      try {
        capture(EVENTS.billing_portal_open, { source: 'billing' })
        const result = await createPortal({
          variables: {
            returnUrl: returnUrl ?? billingPortalReturnUrl(),
          },
        })
        const url = result.data?.createWorkerBillingPortal?.url?.trim()
        if (!url) {
          throw new Error(
            'Billing portal could not be opened. Please try again.',
          )
        }
        window.location.href = url
      } catch (error: unknown) {
        setPortalLoading(false)
        showAppToast({
          title: 'Could not open billing portal',
          description: getFriendlyErrorMessage(
            error,
            'Subscription management is unavailable right now.',
          ),
          type: 'error',
        })
      }
    },
    [createPortal, portalLoading],
  )

  return {
    startCheckout,
    openBillingPortal,
    checkoutLoading,
    portalLoading,
  }
}
