'use client'

import { useApolloClient } from '@apollo/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { syncMembershipFromStripe } from '@/app/(dashboard)/billing/helpers/syncMembership'
import { isMembershipSynced } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'

const POLL_MS = 2000
const POLL_ATTEMPTS = 8

type BillingCheckoutReturnHandlerProps = {
  hasUnlimitedQuotes: boolean
  onRefetchBilling: () => Promise<unknown>
}

export function BillingCheckoutReturnHandler({
  hasUnlimitedQuotes,
  onRefetchBilling,
}: BillingCheckoutReturnHandlerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const apolloClient = useApolloClient()
  const setMe = useUserStore((s) => s.setMe)
  const handledRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || handledRef.current) return
      const checkout = searchParams.get('checkout')
      if (!checkout) return
      handledRef.current = true

      if (checkout === 'success') {
        capture(EVENTS.checkout_success, { source: 'billing' })
      } else if (checkout === 'cancel' || checkout === 'cancelled') {
        capture(EVENTS.checkout_cancel, { source: 'billing' })
        showAppToast({
          title: 'Checkout cancelled',
          description: 'You can start your free trial anytime from this page.',
          type: 'info',
        })
        router.replace('/billing', { scroll: false })
        return
      }

      if (checkout !== 'success') return

      let attempts = 0
      const poll = async () => {
        await onRefetchBilling()
        const meResult = await syncMembershipFromStripe(apolloClient, setMe)
        const membership = meResult.membership

        attempts += 1
        if (isMembershipSynced(membership) || attempts >= POLL_ATTEMPTS) {
          if (isMembershipSynced(membership)) {
            showAppToast({
              title: 'Slashie Unlimited active',
              description: "You're on Slashie Unlimited — trial started.",
              type: 'success',
            })
          }
          router.replace('/billing', { scroll: false })
          return
        }

        window.setTimeout(() => {
          void poll()
        }, POLL_MS)
      }

      if (!hasUnlimitedQuotes) {
        void poll()
      } else {
        void syncMembershipFromStripe(apolloClient, setMe)
        router.replace('/billing', { scroll: false })
      }
    },
    [
      apolloClient,
      hasUnlimitedQuotes,
      onRefetchBilling,
      router,
      searchParams,
      setMe,
    ],
  )

  return <div ref={onMount} hidden aria-hidden />
}
