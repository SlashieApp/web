'use client'

import { Box, Grid, HStack, Heading, List, Stack, Text } from '@chakra-ui/react'

import { useMe } from '@/app/(auth)/store/user'
import { hasUnlimitedQuoting } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { getAuthToken } from '@/utils/auth'
import { Badge, Button, Link } from '@ui'

import { pricingAfterTrialLine } from '../helpers/formatPricing'
import type { PricingRecord } from '../helpers/getPricingForPage'
import {
  UNLIMITED_PLAN_FEATURES,
  UNLIMITED_PLAN_RIBBON,
  buildWorkerFreePlan,
} from '../helpers/pricingPlans'
import { PricingUnlimitedCta } from './PricingUnlimitedCta'

type PricingPlanCardsProps = {
  pricing: PricingRecord
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <List.Item display="flex" gap={3} alignItems="flex-start">
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxSize="18px"
        borderRadius="full"
        bg="primary.500"
        color="white"
        flexShrink={0}
        mt="2px"
        aria-hidden
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <title>Included</title>
          <path
            d="M2.5 6l2.5 2.5 4.5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
      <Text as="span" fontSize="sm" color="cardFg" lineHeight="tall">
        {children}
      </Text>
    </List.Item>
  )
}

function PlanTypeIcon({ children }: { children: React.ReactNode }) {
  return (
    <Box
      boxSize="44px"
      borderRadius="full"
      bg="primary.100"
      color="primary.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      aria-hidden
    >
      {children}
    </Box>
  )
}

function WorkerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <title>Worker</title>
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 7V5h6v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UnlimitedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <title>Unlimited</title>
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlanBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      bg="transparent"
      color="primary.700"
      borderWidth="1px"
      borderColor="primary.300"
      borderRadius="full"
      px={3}
      py={1}
      fontSize="2xs"
      fontWeight={800}
      letterSpacing="0.08em"
      w="fit-content"
    >
      {children}
    </Badge>
  )
}

function PlanPrice({
  amount,
  suffix,
  accent = false,
}: {
  amount: string
  suffix?: string
  accent?: boolean
}) {
  return (
    <HStack gap={2} align="baseline" flexWrap="wrap">
      <Text
        fontSize="3xl"
        fontWeight={800}
        color={accent ? 'primary.700' : 'cardFg'}
        lineHeight="1"
      >
        {amount}
      </Text>
      {suffix ? (
        <Text fontSize="md" fontWeight={600} color="formLabelMuted">
          {suffix}
        </Text>
      ) : null}
    </HStack>
  )
}

function WorkerFreePlanCta() {
  const me = useMe()
  const isAuthenticated = Boolean(getAuthToken())
  const hasWorkerProfile = Boolean(me?.worker?.id)
  const isCurrentFreePlan =
    isAuthenticated &&
    hasWorkerProfile &&
    !hasUnlimitedQuoting(me?.worker?.membership)

  if (isCurrentFreePlan) {
    return (
      <Button w="full" variant="secondary" disabled opacity={0.72}>
        Current plan
      </Button>
    )
  }

  return (
    <Link href="/register" _hover={{ textDecoration: 'none' }}>
      <Button w="full" variant="secondary">
        Get started
      </Button>
    </Link>
  )
}

function PlanCardShell({
  children,
  featured = false,
  ribbon,
}: {
  children: React.ReactNode
  featured?: boolean
  ribbon?: string
}) {
  return (
    <Box
      borderWidth={featured ? '2px' : '1px'}
      borderColor={featured ? 'primary.400' : 'cardBorder'}
      borderRadius="2xl"
      bg="cardBg"
      p={{ base: 5, md: 6 }}
      boxShadow={featured ? 'md' : 'sm'}
      position="relative"
      h="full"
      overflow="hidden"
    >
      {ribbon ? (
        <Badge
          position="absolute"
          top={4}
          right={4}
          bg="primary.500"
          color="white"
          borderRadius="md"
          px={2.5}
          py={1}
          fontSize="2xs"
          fontWeight={800}
          letterSpacing="0.04em"
          maxW="9rem"
          textAlign="center"
          lineHeight="short"
        >
          ⭐ {ribbon}
        </Badge>
      ) : null}
      {children}
    </Box>
  )
}

export function PricingPlanCards({ pricing }: PricingPlanCardsProps) {
  const workerFreePlan = buildWorkerFreePlan(pricing.freeQuotesPerMonth)
  const trialLabel = pricing.trialLabel?.trim()

  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
      gap={5}
      w="full"
      maxW="4xl"
      mx="auto"
      alignItems="stretch"
    >
      <PlanCardShell>
        <Stack gap={5} h="full">
          <Stack gap={3}>
            <PlanTypeIcon>
              <WorkerIcon />
            </PlanTypeIcon>
            <Stack gap={1}>
              <Heading size="md">{workerFreePlan.title}</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                {workerFreePlan.subtitle}
              </Text>
            </Stack>
          </Stack>
          <Stack gap={3}>
            <PlanPrice
              amount={workerFreePlan.price}
              suffix={workerFreePlan.priceSuffix}
            />
            <PlanBadge>{workerFreePlan.badge}</PlanBadge>
          </Stack>
          <List.Root gap={3} ps={0} style={{ listStyle: 'none' }}>
            {workerFreePlan.features.map((feature) => (
              <PlanFeature key={feature}>{feature}</PlanFeature>
            ))}
          </List.Root>
          <Box mt="auto">
            <WorkerFreePlanCta />
          </Box>
        </Stack>
      </PlanCardShell>

      <PlanCardShell featured ribbon={UNLIMITED_PLAN_RIBBON}>
        <Stack gap={5} h="full">
          <Stack gap={3} pe={{ base: 0, lg: 28 }}>
            <PlanTypeIcon>
              <UnlimitedIcon />
            </PlanTypeIcon>
            <Stack gap={1}>
              <Heading size="md">{pricing.productName}</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                {pricing.description?.trim() || 'For serious workers'}
              </Text>
            </Stack>
          </Stack>
          <Stack gap={3}>
            <PlanPrice amount={trialLabel || 'Free trial'} suffix="" accent />
            <Text fontSize="sm" color="formLabelMuted">
              {pricingAfterTrialLine(pricing)}
            </Text>
            <PlanBadge>UNLIMITED QUOTES</PlanBadge>
          </Stack>
          <List.Root gap={3} ps={0} style={{ listStyle: 'none' }}>
            {UNLIMITED_PLAN_FEATURES.map((feature) => (
              <PlanFeature key={feature}>{feature}</PlanFeature>
            ))}
          </List.Root>
          <PricingUnlimitedCta />
        </Stack>
      </PlanCardShell>
    </Grid>
  )
}
