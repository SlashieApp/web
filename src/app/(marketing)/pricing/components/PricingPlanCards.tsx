'use client'

import { Box, Grid, HStack, Heading, List, Stack, Text } from '@chakra-ui/react'

import { useMe } from '@/app/(auth)/store/user'
import { hasUnlimitedQuoting } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { type Messages, formatMessage } from '@/i18n/getDictionary'
import { getAuthToken } from '@/utils/auth'
import { Badge, Button, Link } from '@ui'

import {
  formatLocalizedPricingInterval,
  pricingDisplayPrice,
} from '../helpers/formatPricing'
import type { PricingRecord } from '../helpers/getPricingForPage'
import { buildWorkerFreePlan } from '../helpers/pricingPlans'
import { PricingUnlimitedCta } from './PricingUnlimitedCta'

type PricingPlanCardsProps = {
  messages: Messages['pricing']['plans']
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
        bg="action.primary"
        color="text.onGreen"
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
      <Text as="span" fontSize="sm" color="text.default" lineHeight="tall">
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
      bg="status.success.soft"
      color="status.success.fg"
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
      color="text.link"
      borderWidth="1px"
      /* TODO(sdl): green accent border mapped to border.focus */
      borderColor="border.focus"
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
        color={accent ? 'text.link' : 'text.default'}
        lineHeight="1"
      >
        {amount}
      </Text>
      {suffix ? (
        <Text fontSize="md" fontWeight={600} color="text.muted">
          {suffix}
        </Text>
      ) : null}
    </HStack>
  )
}

function WorkerFreePlanCta({
  messages,
}: {
  messages: Messages['pricing']['plans']
}) {
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
        {messages.currentPlan}
      </Button>
    )
  }

  return (
    <Link href="/register" _hover={{ textDecoration: 'none' }}>
      <Button w="full" variant="secondary">
        {messages.getStarted}
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
      /* TODO(sdl): featured green accent border mapped to border.focus */
      borderColor={featured ? 'border.focus' : 'border.default'}
      borderRadius="2xl"
      bg="bg.surface"
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
          bg="action.primary"
          color="text.onGreen"
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

export function PricingPlanCards({ messages, pricing }: PricingPlanCardsProps) {
  const workerFreePlan = buildWorkerFreePlan(
    pricing.freeQuotesPerMonth,
    messages.free,
  )
  const trialLabel = pricing.trialLabel?.trim()
  const afterTrialLine = formatMessage(messages.unlimited.afterTrialLine, {
    price: pricingDisplayPrice(pricing),
    interval: formatLocalizedPricingInterval(
      pricing.priceInterval,
      messages.unlimited.intervals,
    ),
  })

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
              <Text fontSize="sm" color="text.muted">
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
            <WorkerFreePlanCta messages={messages} />
          </Box>
        </Stack>
      </PlanCardShell>

      <PlanCardShell featured ribbon={messages.unlimited.ribbon}>
        <Stack gap={5} h="full">
          <Stack gap={3} pe={{ base: 0, lg: 28 }}>
            <PlanTypeIcon>
              <UnlimitedIcon />
            </PlanTypeIcon>
            <Stack gap={1}>
              <Heading size="md">{pricing.productName}</Heading>
              <Text fontSize="sm" color="text.muted">
                {pricing.description?.trim() ||
                  messages.unlimited.descriptionFallback}
              </Text>
            </Stack>
          </Stack>
          <Stack gap={3}>
            <PlanPrice
              amount={trialLabel || messages.unlimited.trialFallback}
              suffix=""
              accent
            />
            <Text fontSize="sm" color="text.muted">
              {afterTrialLine}
            </Text>
            <PlanBadge>{messages.unlimited.badge}</PlanBadge>
          </Stack>
          <List.Root gap={3} ps={0} style={{ listStyle: 'none' }}>
            {messages.unlimited.features.map((feature) => (
              <PlanFeature key={feature}>{feature}</PlanFeature>
            ))}
          </List.Root>
          <PricingUnlimitedCta messages={messages} />
        </Stack>
      </PlanCardShell>
    </Grid>
  )
}
