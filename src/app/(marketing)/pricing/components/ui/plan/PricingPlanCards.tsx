import {
  Box,
  Grid,
  HStack,
  Heading,
  List,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuBriefcase, LuCheck, LuZap } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Badge, Button, Link } from '@ui'

import {
  formatPricingAmount,
  pricingDisplayPrice,
  pricingPerInterval,
  pricingPriceLine,
  pricingTrialLength,
} from '../../../helpers/formatPricing'
import type { PricingRecord } from '../../../helpers/getPricingForPage'
import type messages from '../../../i11n.json'
import type { PricingAction, PricingViewConfig } from '../../../views'
import { PricingCheckoutButton } from './PricingCheckoutButton'

type PricingCopy = (typeof messages)['en']
export type PricingPlansCopy = PricingCopy['plans']

function PlanAction({
  action,
  labels,
  featured,
}: {
  action: PricingAction
  labels: PricingPlansCopy['actions']
  featured: boolean
}) {
  if (action.kind === 'pending') {
    return <Skeleton h="44px" borderRadius="full" />
  }
  if (action.kind === 'checkout') {
    return <PricingCheckoutButton label={labels[action.label]} />
  }
  return (
    <Button asChild w="full" variant={featured ? 'primary' : 'secondary'}>
      <Link href={action.href} _hover={{ textDecoration: 'none' }}>
        {labels[action.label]}
      </Link>
    </Button>
  )
}

function PlanCard({
  featured = false,
  icon,
  title,
  subtitle,
  amount,
  suffix,
  note,
  features,
  current,
  yourPlan,
  action,
  labels,
}: {
  featured?: boolean
  icon: ReactNode
  title: string
  subtitle: string
  amount: string
  suffix?: string
  note?: string
  features: readonly string[]
  current: boolean
  yourPlan: string
  action: PricingAction | null
  labels: PricingPlansCopy['actions']
}) {
  return (
    <Stack
      gap={5}
      h="full"
      borderWidth={featured ? '2px' : '1px'}
      borderColor={featured ? 'border.focus' : 'border.default'}
      borderRadius="lg"
      bg="bg.surface"
      boxShadow={featured ? 'e2' : 'e1'}
      p={{ base: 5, md: 6 }}
    >
      <HStack justify="space-between" align="flex-start">
        <Box
          boxSize="44px"
          borderRadius="full"
          bg="status.success.soft"
          color="status.success.fg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          {icon}
        </Box>
        {current ? (
          <Badge
            bg="status.success.soft"
            color="status.success.fg"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight={700}
          >
            {yourPlan}
          </Badge>
        ) : null}
      </HStack>
      <Stack gap={1}>
        <Heading as="h2" size="md">
          {title}
        </Heading>
        <Text fontSize="sm" color="text.muted">
          {subtitle}
        </Text>
      </Stack>
      <Stack gap={1.5}>
        <HStack gap={2} align="baseline" flexWrap="wrap">
          <Text
            fontSize="3xl"
            fontWeight={800}
            lineHeight="1"
            color={featured ? 'text.link' : 'text.default'}
          >
            {amount}
          </Text>
          {suffix ? (
            <Text fontSize="md" fontWeight={600} color="text.muted">
              {suffix}
            </Text>
          ) : null}
        </HStack>
        {note ? (
          <Text fontSize="sm" color="text.muted">
            {note}
          </Text>
        ) : null}
      </Stack>
      <List.Root gap={3} ps={0} listStyle="none">
        {features.map((feature) => (
          <List.Item
            key={feature}
            display="flex"
            gap={3}
            alignItems="flex-start"
          >
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
              <LuCheck size={11} strokeWidth={3} />
            </Box>
            <Text as="span" fontSize="sm" lineHeight="tall">
              {feature}
            </Text>
          </List.Item>
        ))}
      </List.Root>
      {action ? (
        <Box mt="auto">
          <PlanAction action={action} labels={labels} featured={featured} />
        </Box>
      ) : null}
    </Stack>
  )
}

/**
 * Free and Slashie Unlimited side by side (stacked on phones), rendered from
 * the view's config: which card is "Your plan", whether Unlimited leads with
 * the trial, and each card's button. Prices and trial come from the API. The
 * store purchases note sits under the cards, the same for every view.
 */
export function PricingPlanCards({
  pricing,
  config,
  copy,
  intervals,
}: {
  pricing: PricingRecord
  config: PricingViewConfig
  copy: PricingPlansCopy
  intervals: PricingCopy['intervals']
}) {
  // Free has no billing period of its own: it reads per one interval.
  const freePerInterval = pricingPerInterval(
    { priceInterval: pricing.priceInterval, priceIntervalCount: 1 },
    intervals,
  )
  const perInterval = pricingPerInterval(pricing, intervals)
  const price = pricingDisplayPrice(pricing)
  const trial = config.trial ? pricingTrialLength(pricing.trialDays) : null
  const count = pricing.freeQuotesPerMonth

  return (
    <Stack gap={4} w="full" maxW="4xl" mx="auto">
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} w="full">
        <PlanCard
          icon={<LuBriefcase size={22} />}
          title={copy.free.title}
          subtitle={copy.free.subtitle}
          amount={formatPricingAmount(0, pricing.priceCurrency)}
          suffix={freePerInterval}
          features={copy.free.features.map((feature) =>
            formatMessage(feature, { count }),
          )}
          current={config.current === 'free'}
          yourPlan={copy.yourPlan}
          action={config.free}
          labels={copy.actions}
        />
        <PlanCard
          featured
          icon={<LuZap size={22} />}
          title={pricing.productName}
          subtitle={copy.unlimited.subtitle}
          amount={
            trial
              ? formatMessage(copy.trial[trial.unit], { count: trial.count })
              : price
          }
          suffix={trial ? undefined : perInterval}
          note={
            trial
              ? formatMessage(copy.thenPrice, {
                  priceLine: pricingPriceLine(pricing, intervals),
                })
              : undefined
          }
          features={copy.unlimited.features}
          current={config.current === 'unlimited'}
          yourPlan={copy.yourPlan}
          action={config.unlimited}
          labels={copy.actions}
        />
      </Grid>
      <Text fontSize="sm" color="text.muted">
        {copy.purchasesNote}
      </Text>
    </Stack>
  )
}
