'use client'

import { useQuery } from '@apollo/client/react'
import { Box, List, Stack, Text } from '@chakra-ui/react'
import type { MeQuery, PricingQuery } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { LuCreditCard, LuGauge, LuInfo } from 'react-icons/lu'

import { useMe } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'
import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'
import { MembershipRefreshOnMount } from '@/app/(dashboard)/components/MembershipRefreshOnMount'
import { MembershipCancelNotice } from '@/app/(dashboard)/components/membership/MembershipCancelNotice'
import { MembershipStatusBadge } from '@/app/(dashboard)/components/membership/MembershipStatusBadge'
import { MembershipStatusDetail } from '@/app/(dashboard)/components/membership/MembershipStatusDetail'
import Pricing from '@/app/(marketing)/pricing/graphql/Pricing.gql'
import {
  formatPricingInterval,
  pricingAfterTrialLine,
  pricingDisplayPrice,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import Me from '@/graphql/Me.gql'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link } from '@ui'

import {
  hasUnlimitedQuoting,
  isMembershipCanceled,
  isMembershipPaymentWarning,
  pickMembershipSnapshot,
} from '../helpers/workerMembershipHelpers'
import { BillingCheckoutReturnHandler } from './components/BillingCheckoutReturnHandler'
import { BillingNonWorkerState } from './components/BillingNonWorkerState'
import { BillingQuoteMeter } from './components/BillingQuoteMeter'
import { BillingViewCapture } from './components/BillingViewCapture'
import { useBillingActions } from './helpers/useBillingActions'
import bag from './i11n.json'

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <List.Item display="flex" gap={2} alignItems="flex-start">
      <Box
        as="span"
        color="text.link"
        fontWeight={800}
        lineHeight="1.4"
        aria-hidden
      >
        ✓
      </Box>
      <Text as="span" fontSize="sm" color="text.default" lineHeight="tall">
        {children}
      </Text>
    </List.Item>
  )
}

function BillingNotice({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'neutral' | 'danger' | 'warning'
  title: string
  body?: string
}) {
  const styles = {
    success: {
      borderColor: 'status.success.soft',
      bg: 'status.success.soft',
      color: 'status.success.fg',
    },
    danger: {
      borderColor: 'status.danger.soft',
      bg: 'status.danger.soft',
      color: 'status.danger.fg',
    },
    warning: {
      borderColor: 'status.warning.soft',
      bg: 'status.warning.soft',
      color: 'status.warning.fg',
    },
    neutral: {
      borderColor: 'border.default',
      bg: 'bg.surface',
      color: 'text.default',
    },
  }[tone]

  return (
    <Box
      borderWidth="1px"
      borderColor={styles.borderColor}
      borderRadius="xl"
      bg={styles.bg}
      p={4}
    >
      <Text fontWeight={700} color={styles.color}>
        {title}
      </Text>
      {body ? (
        <Text fontSize="sm" color={styles.color} mt={1}>
          {body}
        </Text>
      ) : null}
    </Box>
  )
}

function Page() {
  const t = useI11n(bag)
  const me = useMe()
  const searchParams = useSearchParams()
  const checkoutState = searchParams.get('checkout')
  const sectionLinks = [
    { label: t.navOverview, href: '#overview' },
    { label: t.navUsage, href: '#usage' },
    { label: t.navPlan, href: '#plan' },
  ] as const

  const {
    data: billingData,
    loading: billingLoading,
    error: billingError,
    refetch,
  } = useQuery<MeQuery>(Me, {
    skip: !me?.worker?.id,
    fetchPolicy: 'cache-and-network',
  })

  const { data: pricingData, loading: pricingLoading } = useQuery<PricingQuery>(
    Pricing,
    { fetchPolicy: 'cache-first' },
  )

  const { startCheckout, openBillingPortal, checkoutLoading, portalLoading } =
    useBillingActions()

  const zustandMembership = me?.worker?.membership
  const membership = pickMembershipSnapshot(
    zustandMembership,
    billingData?.me?.worker?.membership,
  )
  const pricing = pricingData?.pricing
  const loading = billingLoading || pricingLoading

  const hasUnlimited = hasUnlimitedQuoting(membership)
  const isActivating =
    checkoutState === 'success' && !hasUnlimited && !billingError
  const showCheckoutSuccess =
    checkoutState === 'success' && (hasUnlimited || isActivating)
  const showCheckoutCancel =
    checkoutState === 'cancel' || checkoutState === 'cancelled'
  const interval = pricing
    ? formatPricingInterval(pricing.priceInterval)
    : 'month'
  const upgradeLabel =
    membership &&
    (isMembershipCanceled(membership) || !membership.canStartTrial)
      ? t.resubscribe
      : t.startTrial

  if (!me?.worker?.id) {
    return (
      <>
        <MembershipRefreshOnMount />
        <BillingViewCapture />
        <DashboardPageLayout
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.descriptionNonWorker}
        >
          <BillingNonWorkerState />
        </DashboardPageLayout>
      </>
    )
  }

  return (
    <>
      <MembershipRefreshOnMount />
      <BillingViewCapture />
      <BillingCheckoutReturnHandler
        hasUnlimitedQuotes={hasUnlimited}
        onRefetchBilling={refetch}
      />
      <DashboardPageLayout
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        sections={sectionLinks}
        afterNav={
          <>
            {showCheckoutSuccess ? (
              <BillingNotice
                tone="success"
                title={
                  isActivating
                    ? t.checkoutActivatingTitle
                    : t.checkoutActiveTitle
                }
                body={isActivating ? t.checkoutActivatingBody : undefined}
              />
            ) : null}
            {showCheckoutCancel ? (
              <BillingNotice tone="neutral" title={t.checkoutCancelledTitle} />
            ) : null}
            {billingError ? (
              <BillingNotice tone="danger" title={t.billingErrorTitle} />
            ) : null}
          </>
        }
        sidebar={
          membership ? (
            <>
              <DashboardSectionCard
                title={t.aboutTitle}
                description={t.aboutDescription}
                icon={<LuInfo size={18} aria-hidden />}
              >
                <Text fontSize="sm" color="text.muted" lineHeight="tall">
                  {t.aboutBody}
                </Text>
              </DashboardSectionCard>
              <Card
                layout="section"
                p={{ base: 4, md: 5 }}
                header={
                  <Stack gap={0.5}>
                    <Text fontSize="md" fontWeight={600}>
                      {t.relatedTitle}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {t.relatedDescription}
                    </Text>
                  </Stack>
                }
              >
                <Stack gap={3}>
                  <Link
                    href={'/earnings'}
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    {t.relatedEarnings}
                  </Link>
                  <Link
                    href={'/profile?section=worker'}
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    {t.relatedWorkerProfile}
                  </Link>
                  <Link
                    href={'/account'}
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    {t.relatedAccount}
                  </Link>
                </Stack>
              </Card>
            </>
          ) : undefined
        }
      >
        {loading && !membership ? (
          <Stack gap={4}>
            <Box h="24" borderRadius="xl" bg="bg.subtle" />
            <Box h="40" borderRadius="xl" bg="bg.subtle" />
          </Stack>
        ) : membership ? (
          <>
            <MembershipCancelNotice membership={membership} />

            {!hasUnlimited ? (
              <DashboardSectionCard
                id="usage"
                title={t.usageTitle}
                description={formatMessage(t.usageDescription, {
                  count: membership.freeQuotesPerMonth,
                })}
                icon={<LuGauge size={18} aria-hidden />}
              >
                <Stack gap={3}>
                  <BillingQuoteMeter
                    used={membership.quotesUsedThisMonth}
                    total={membership.freeQuotesPerMonth}
                  />
                  {membership.quotesRemainingThisMonth <= 0 ? (
                    <Text
                      fontSize="sm"
                      color="status.warning.fg"
                      fontWeight={600}
                    >
                      {t.usageExhausted}
                    </Text>
                  ) : null}
                </Stack>
              </DashboardSectionCard>
            ) : null}

            <Card
              id="plan"
              layout="section"
              p={{ base: 4, md: 5 }}
              scrollMarginTop="96px"
              isActive={hasUnlimited}
              header={
                <Stack
                  direction="row"
                  justify="space-between"
                  align="flex-start"
                  gap={3}
                  w="full"
                >
                  <Stack gap={0.5} pe={{ base: 0, md: 2 }} minW={0}>
                    <Text
                      as="h2"
                      fontSize="md"
                      fontWeight={600}
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <LuCreditCard size={18} aria-hidden />
                      {membership.planName ??
                        pricing?.productName ??
                        t.planFallbackName}
                    </Text>
                    <MembershipStatusDetail membership={membership} />
                  </Stack>
                  <MembershipStatusBadge membership={membership} />
                </Stack>
              }
            >
              <Stack gap={5}>
                {pricing && !hasUnlimited ? (
                  <Stack gap={0}>
                    {pricing.trialLabel?.trim() ? (
                      <Text
                        fontSize="2xl"
                        fontWeight={800}
                        color="text.link"
                        lineHeight="1"
                      >
                        {pricing.trialLabel.trim()}
                      </Text>
                    ) : null}
                    <Text fontSize="sm" color="text.muted" mt={2}>
                      {pricingAfterTrialLine(pricing)}
                    </Text>
                    <Text fontSize="xs" color="text.muted" mt={1}>
                      {formatMessage(t.thenPrice, {
                        price: pricingDisplayPrice(pricing),
                        interval,
                      })}
                    </Text>
                  </Stack>
                ) : null}

                {isMembershipPaymentWarning(membership.subscriptionStatus) ? (
                  <BillingNotice
                    tone="warning"
                    title={
                      membership.subscriptionStatus ===
                      WorkerSubscriptionStatus.PastDue
                        ? t.paymentPastDue
                        : t.paymentUnpaid
                    }
                  />
                ) : null}

                {!hasUnlimited && pricing ? (
                  <List.Root gap={2.5} ps={0} style={{ listStyle: 'none' }}>
                    <PlanFeature>{t.featureUnlimited}</PlanFeature>
                    <PlanFeature>{t.featureBrowse}</PlanFeature>
                    <PlanFeature>
                      {pricing.trialLabel
                        ? formatMessage(t.featurePriceWithTrial, {
                            trial: pricing.trialLabel,
                            price: pricingDisplayPrice(pricing),
                            interval,
                          })
                        : formatMessage(t.featurePrice, {
                            price: pricingDisplayPrice(pricing),
                            interval,
                          })}
                    </PlanFeature>
                  </List.Root>
                ) : null}

                <Stack gap={3}>
                  {membership.canUpgrade ? (
                    <Button
                      w="full"
                      onClick={() => void startCheckout('billing')}
                      loading={checkoutLoading}
                      disabled={checkoutLoading || portalLoading}
                    >
                      {upgradeLabel}
                    </Button>
                  ) : null}
                  {membership.canManageBilling ? (
                    <Button
                      w="full"
                      variant={membership.canUpgrade ? 'secondary' : 'primary'}
                      onClick={() => void openBillingPortal()}
                      loading={portalLoading}
                      disabled={portalLoading || checkoutLoading}
                    >
                      {membership.subscriptionStatus ===
                      WorkerSubscriptionStatus.PastDue
                        ? t.fixPayment
                        : t.manageBilling}
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </Card>
          </>
        ) : null}
      </DashboardPageLayout>
    </>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  )
}
