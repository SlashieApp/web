'use client'

import { useQuery } from '@apollo/client/react'
import { Box, List, Stack, Text } from '@chakra-ui/react'
import type { MeQuery, PricingQuery } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'
import { useSearchParams } from 'next/navigation'
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
import { Button, Card, Link } from '@ui'

import {
  hasUnlimitedQuoting,
  isMembershipPaymentWarning,
  membershipUpgradeLabel,
  pickMembershipSnapshot,
} from '../../helpers/workerMembershipHelpers'
import { useBillingActions } from '../helpers/useBillingActions'
import { BillingCheckoutReturnHandler } from './BillingCheckoutReturnHandler'
import { BillingNonWorkerState } from './BillingNonWorkerState'
import { BillingQuoteMeter } from './BillingQuoteMeter'
import { BillingViewCapture } from './BillingViewCapture'

const SECTION_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Usage', href: '#usage' },
  { label: 'Plan', href: '#plan' },
] as const

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

export function BillingPage() {
  const me = useMe()
  const searchParams = useSearchParams()
  const checkoutState = searchParams.get('checkout')

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

  if (!me?.worker?.id) {
    return (
      <>
        <MembershipRefreshOnMount />
        <BillingViewCapture />
        <DashboardPageLayout
          eyebrow="BILLING"
          title="Billing & membership"
          description="Manage your Slashie Unlimited subscription and quote allowance."
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
        eyebrow="BILLING"
        title="Billing & membership"
        description="Manage your Slashie Unlimited subscription and monthly quote allowance."
        sections={SECTION_LINKS}
        afterNav={
          <>
            {showCheckoutSuccess ? (
              <BillingNotice
                tone="success"
                title={
                  isActivating
                    ? 'Activating your subscription…'
                    : 'Slashie Unlimited is active.'
                }
                body={
                  isActivating
                    ? 'This usually takes a few seconds after checkout.'
                    : undefined
                }
              />
            ) : null}
            {showCheckoutCancel ? (
              <BillingNotice
                tone="neutral"
                title="Checkout cancelled — you can try again anytime."
              />
            ) : null}
            {billingError ? (
              <BillingNotice
                tone="danger"
                title="Could not load billing details. Refresh the page or try again shortly."
              />
            ) : null}
          </>
        }
        sidebar={
          membership ? (
            <>
              <DashboardSectionCard
                title="About platform billing"
                description="Separate from job payments."
                icon={<LuInfo size={18} aria-hidden />}
              >
                <Text fontSize="sm" color="text.muted" lineHeight="tall">
                  Job payments are arranged directly with customers. This
                  subscription is for platform access only — Slashie does not
                  process task payments.
                </Text>
              </DashboardSectionCard>
              <Card
                layout="section"
                p={{ base: 4, md: 5 }}
                header={
                  <Stack gap={0.5}>
                    <Text fontSize="md" fontWeight={600}>
                      Related
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      Other worker account tools.
                    </Text>
                  </Stack>
                }
              >
                <Stack gap={3}>
                  <Link
                    href="/earnings"
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    Earnings log →
                  </Link>
                  <Link
                    href="/profile?section=worker"
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    Worker profile →
                  </Link>
                  <Link
                    href="/account"
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    Account & security →
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
                title="Free tier usage"
                description={`${membership.freeQuotesPerMonth} quotes per UTC month on the free plan.`}
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
                      You&apos;ve used all free quotes this month. Upgrade for
                      unlimited quoting.
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
                        'Slashie Unlimited'}
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
                      Then {pricingDisplayPrice(pricing)} per {interval} unless
                      you cancel
                    </Text>
                  </Stack>
                ) : null}

                {isMembershipPaymentWarning(membership.subscriptionStatus) ? (
                  <BillingNotice
                    tone="warning"
                    title={
                      membership.subscriptionStatus ===
                      WorkerSubscriptionStatus.PastDue
                        ? 'Payment issue — update your payment method to keep unlimited quotes.'
                        : 'Payment required — update billing to restore unlimited quotes.'
                    }
                  />
                ) : null}

                {!hasUnlimited && pricing ? (
                  <List.Root gap={2.5} ps={0} style={{ listStyle: 'none' }}>
                    <PlanFeature>Unlimited quotes while subscribed</PlanFeature>
                    <PlanFeature>
                      Browse tasks without a monthly quote cap
                    </PlanFeature>
                    <PlanFeature>
                      {pricing.trialLabel
                        ? `${pricing.trialLabel}, then ${pricingDisplayPrice(pricing)}/${interval}`
                        : `${pricingDisplayPrice(pricing)}/${interval}`}
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
                      {membershipUpgradeLabel(membership)}
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
                        ? 'Fix payment'
                        : 'Manage billing'}
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
