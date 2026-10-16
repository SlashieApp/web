'use client'

import { useApolloClient } from '@apollo/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'

import bag from '../i11n.json'
import { syncMembershipFromStripe } from './syncMembership'

const POLL_MS = 2000
const POLL_ATTEMPTS = 8

export type CheckoutReturn = 'returning' | 'delayed' | null

/**
 * Back from Stripe Checkout (`?checkout=success|cancelled`). Success polls
 * Stripe until the plan is active (`returning`), or says it's slow after
 * about 16 seconds (`delayed`). `checkAgain` re-syncs once, for that and for
 * an unfinished Checkout. Attach `rootRef` to the page root.
 */
export function useCheckoutReturn() {
  const t = useI11n(bag).toasts
  const searchParams = useSearchParams()
  const router = useRouter()
  const localize = useLocalizedHref()
  const apolloClient = useApolloClient()
  const setMe = useUserStore((s) => s.setMe)
  const [checkout, setCheckout] = useState<CheckoutReturn>(null)
  const handledRef = useRef(false)

  const sync = useCallback(async () => {
    const { membership } = await syncMembershipFromStripe(apolloClient, setMe)
    return Boolean(membership?.hasUnlimitedQuotes)
  }, [apolloClient, setMe])

  const rootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || handledRef.current) return
      const result = searchParams.get('checkout')
      if (!result) return
      handledRef.current = true
      router.replace(localize('/billing'), { scroll: false })

      if (result !== 'success') {
        capture(EVENTS.checkout_cancel, { source: 'billing' })
        showAppToast({
          title: t.checkoutCancelledTitle,
          description: t.checkoutCancelledBody,
          type: 'info',
        })
        return
      }

      capture(EVENTS.checkout_success, { source: 'billing' })
      setCheckout('returning')
      let attempts = 0
      const poll = async () => {
        attempts += 1
        if (await sync()) {
          setCheckout(null)
          showAppToast({ title: t.activatedTitle, type: 'success' })
          return
        }
        if (attempts >= POLL_ATTEMPTS) {
          setCheckout('delayed')
          return
        }
        window.setTimeout(() => void poll(), POLL_MS)
      }
      void poll()
    },
    [localize, router, searchParams, sync, t],
  )

  const checkAgain = useCallback(async () => {
    setCheckout('returning')
    if (await sync()) {
      setCheckout(null)
      showAppToast({ title: t.activatedTitle, type: 'success' })
      return
    }
    setCheckout('delayed')
  }, [sync, t])

  return { checkout, checkAgain, rootRef }
}
