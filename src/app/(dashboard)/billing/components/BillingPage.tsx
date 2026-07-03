'use client'

import { useQuery } from '@apollo/client/react'
import { Box, HStack, Heading, List, Stack, Text } from '@chakra-ui/react'
import type { MeQuery, PricingQuery } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'
import { useSearchParams } from 'next/navigation'

import { useMe } from '@/app/(auth)/store/user'
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
import { Button } from '@ui'

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
      <Stack gap={6}>
        <MembershipRefreshOnMount />
        <BillingViewCapture />
        <Stack gap={2}>
          <Heading size="xl">Billing</Heading>
          <Text color="text.muted">
            Manage your Slashie Unlimited subscription and quote allowance.
          </Text>
        </Stack>
        <BillingNonWorkerState />
      </Stack>
    )
  }

  return (
    <Stack gap={6}>
      <MembershipRefreshOnMount />
      <BillingViewCapture />
      <BillingCheckoutReturnHandler
        hasUnlimitedQuotes={hasUnlimited}
        onRefetchBilling={refetch}
      />
      <Stack gap={2}>
        <Heading size="xl">Billing</Heading>
        <Text color="text.muted">
          Manage your Slashie Unlimited subscription and monthly quote
          allowance.
        </Text>
      </Stack>

      {showCheckoutSuccess ? (
        <Box
          borderWidth="1px"
          borderColor="status.success.soft"
          borderRadius="xl"
          bg="status.success.soft"
          p={4}
        >
          <Text fontWeight={700} color="status.success.fg">
            {isActivating
              ? 'Activating your subscription…'
              : 'Slashie Unlimited is active.'}
          </Text>
          {isActivating ? (
            <Text fontSize="sm" color="status.success.fg" mt={1}>
              This usually takes a few seconds after checkout.
            </Text>
          ) : null}
        </Box>
      ) : null}

      {showCheckoutCancel ? (
        <Box
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="xl"
          bg="bg.surface"
          p={4}
        >
          <Text fontWeight={600} color="text.default">
            Checkout cancelled — you can try again anytime.
          </Text>
        </Box>
      ) : null}

      {billingError ? (
        <Box
          borderWidth="1px"
          borderColor="status.danger.soft"
          borderRadius="xl"
          bg="status.danger.soft"
          p={4}
        >
          <Text fontWeight={600} color="status.danger.fg">
            Could not load billing details. Refresh the page or try again
            shortly.
          </Text>
        </Box>
      ) : null}

      {loading && !membership ? (
        <Stack gap={4}>
          <Box h="24" borderRadius="xl" bg="bg.subtle" />
          <Box h="40" borderRadius="xl" bg="bg.subtle" />
        </Stack>
      ) : membership ? (
        <Stack gap={5}>
          <MembershipCancelNotice membership={membership} />

          {!hasUnlimited ? (
            <Box
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="2xl"
              bg="bg.surface"
              p={{ base: 5, md: 6 }}
              boxShadow="e2"
            >
              <Stack gap={5}>
                <Stack gap={1}>
                  <Heading size="sm">Free tier usage</Heading>
                  <Text fontSize="sm" color="text.muted">
                    {membership.freeQuotesPerMonth} quotes per UTC month on the
                    free plan.
                  </Text>
                </Stack>
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
            </Box>
          ) : null}

          <Box
            borderWidth={hasUnlimited ? '2px' : '1px'}
            borderColor={hasUnlimited ? 'action.primary' : 'border.default'}
            borderRadius="2xl"
            bg="bg.surface"
            p={{ base: 5, md: 6 }}
            boxShadow={hasUnlimited ? 'e3' : 'e2'}
            position="relative"
          >
            <Box position="absolute" top={4} right={4}>
              <MembershipStatusBadge membership={membership} />
            </Box>

            <Stack gap={5}>
              <Stack gap={2} pe={{ base: 0, md: 24 }}>
                <Heading size="md">
                  {membership.planName ??
                    pricing?.productName ??
                    'Slashie Unlimited'}
                </Heading>
                <MembershipStatusDetail membership={membership} />
              </Stack>

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
                <Box
                  borderWidth="1px"
                  borderColor="status.warning.soft"
                  borderRadius="lg"
                  bg="status.warning.soft"
                  p={3}
                >
                  <Text
                    fontSize="sm"
                    fontWeight={600}
                    color="status.warning.fg"
                  >
                    {membership.subscriptionStatus ===
                    WorkerSubscriptionStatus.PastDue
                      ? 'Payment issue — update your payment method to keep unlimited quotes.'
                      : 'Payment required — update billing to restore unlimited quotes.'}
                  </Text>
                </Box>
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

              <Stack gap={3} mt={hasUnlimited ? 0 : 2}>
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
          </Box>

          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            Job payments are arranged directly with customers. This subscription
            is for platform access only — Slashie does not process task
            payments.
          </Text>
        </Stack>
      ) : null}
    </Stack>
  )
}
