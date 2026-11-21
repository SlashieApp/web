'use client'

import { useQuery } from '@apollo/client/react'
import { Stack, Text } from '@chakra-ui/react'
import type { PricingQuery } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import { MembershipRefreshOnMount } from '@/app/(dashboard)/components/ui/membership/MembershipRefreshOnMount'
import Pricing from '@/app/(marketing)/pricing/graphql/Pricing.gql'
import { isWorkerSetupComplete } from '@/app/(stepflow)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { useLocale, useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Link } from '@ui'

import { useBillingActions } from '../helpers/useBillingActions'
import { useCheckoutReturn } from '../helpers/useCheckoutReturn'
import { usePromoCode } from '../helpers/usePromoCode'
import bag from '../i11n.json'
import { BILLING_VIEWS, type BillingAction, getBillingView } from '../views'
import { billingActionFor, keepUnlimitedOpens } from '../views/billingAction'
import { BillingViewCapture } from './analytics/BillingViewCapture'
import { BillingPlanCard } from './ui/BillingPlanCard'
import { PromoCodeField } from './ui/PromoCodeField'

/** The first day of next month (UTC), when the free allowance resets. */
function nextMonthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
}

/** The card's button starts Stripe Checkout, so "Have a code?" goes under it (FE-586). */
function startsCheckout(
  action: BillingAction | null,
  membership: Parameters<typeof keepUnlimitedOpens>[0],
): boolean {
  if (action === 'startTrial' || action === 'resubscribe') return true
  return (
    action === 'keepUnlimited' && keepUnlimitedOpens(membership) === 'checkout'
  )
}

/**
 * Plan & billing (views/README.md): one plan card in a 720px column, then
 * the job-payments note and Compare plans. The view comes from the API's
 * membership flags and the Checkout return.
 */
export function BillingScreen() {
  const t = useI11n(bag)
  const locale = useLocale()
  const localize = useLocalizedHref()
  const router = useRouter()
  const me = useUserStore((s) => s.me)
  const { checkout, checkAgain, rootRef } = useCheckoutReturn()
  const { startCheckout, openBillingPortal, checkoutLoading, portalLoading } =
    useBillingActions()
  const promo = usePromoCode()
  // A typed code is checked first; one that can't be used stays on the page (FE-586).
  const checkoutWithCode = async () => {
    const promoCode = await promo.codeForCheckout()
    if (promoCode === false) return
    await startCheckout('billing', { promoCode, onPromoProblem: promo.refuse })
  }
  const pricingQuery = useQuery<PricingQuery>(Pricing, {
    fetchPolicy: 'cache-first',
  })

  const formatDate = useCallback(
    (value: string | null | undefined) => {
      if (!value) return null
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return null
      // UK dates in English (9 Dec 2026), like the rest of the app.
      return new Intl.DateTimeFormat(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
    },
    [locale],
  )

  if (!me) return null

  const worker = me.worker
  const pricing = pricingQuery.data?.pricing ?? null
  const config =
    BILLING_VIEWS[
      getBillingView({
        worker: worker
          ? {
              setupComplete: isWorkerSetupComplete(me),
              membership: worker.membership,
            }
          : null,
        pricing: pricing ? 'ready' : pricingQuery.error ? 'failed' : 'loading',
        checkout,
      })
    ]

  const cardAction = billingActionFor(config.action, worker?.membership ?? null)

  const onAction = (action: BillingAction) => {
    switch (action) {
      case 'becomeWorker':
      case 'finishSetup':
        router.push(localize(workerSetupHref('/billing')))
        return
      case 'startTrial':
      case 'resubscribe':
        void checkoutWithCode()
        return
      case 'keepUnlimited':
        // Unlimited given by Slashie has no Stripe plan to resume (BE-119).
        if (keepUnlimitedOpens(worker?.membership ?? null) === 'checkout') {
          void checkoutWithCode()
          return
        }
        void openBillingPortal()
        return
      case 'manageBilling':
      case 'fixPayment':
        void openBillingPortal()
        return
      case 'checkAgain':
        void checkAgain()
        return
      case 'retryPricing':
        void pricingQuery.refetch()
    }
  }

  return (
    <DashboardPageLayout
      rootRef={rootRef}
      title={t.title}
      description={t.description}
    >
      <MembershipRefreshOnMount />
      <BillingViewCapture />
      <BillingPlanCard
        config={{
          ...config,
          action: cardAction,
        }}
        membership={worker?.membership ?? null}
        pricing={pricing}
        formatDate={formatDate}
        resetsOn={formatDate(nextMonthStart(new Date()).toISOString())}
        actionLoading={checkoutLoading || portalLoading || promo.checking}
        onAction={onAction}
        promo={
          startsCheckout(cardAction, worker?.membership ?? null) ? (
            <PromoCodeField promo={promo} disabled={checkoutLoading} />
          ) : null
        }
      />
      <Stack gap={2}>
        <Text fontSize="sm" color="text.muted">
          {t.paymentNote}
        </Text>
        <Link href="/pricing" fontSize="sm" fontWeight={500} color="text.link">
          {t.comparePlans}
        </Link>
      </Stack>
    </DashboardPageLayout>
  )
}
