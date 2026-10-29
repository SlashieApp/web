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
import { LuCheck, LuSparkles } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlCardSurface, sdlFigure } from '@/theme/styles'
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

/** A plan card's padding: 20, 24 and 28px by breakpoint (the teaser's). */
const CARD_P = { base: 5, md: 6, lg: 7 } as const

/**
 * A card's one button, a pill: outline on Free, plum (`premium`) on the paid
 * plan, as the landing's teaser sets them. Green is not used here: the page's
 * one green button is the marketing header's Get started.
 */
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
    <Button asChild w="full" variant={featured ? 'premium' : 'secondary'}>
      <Link href={action.href} _hover={{ textDecoration: 'none' }}>
        {labels[action.label]}
      </Link>
    </Button>
  )
}

/**
 * One plan: the card recipe of the product and of the landing's teaser (white,
 * a 1px hairline, `e1`, 12px corners), left-aligned: the plan's name as a
 * label, its line, the price as a figure (600, tabular), a hairline, the
 * features with green 600 checks and a pill. The paid plan swaps the hairline
 * and the label for plum (`accent.premium`, with the sparkle) and its pill is
 * plum; nothing else changes between the two, so they read as a pair.
 */
function PlanCard({
  featured = false,
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
  ...dataAttrs
}: {
  featured?: boolean
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
} & Record<`data-${string}`, string>) {
  return (
    <Box
      {...dataAttrs}
      display="flex"
      flexDirection="column"
      gap={5}
      h="full"
      p={CARD_P}
      {...sdlCardSurface}
      borderColor={featured ? 'accent.premium' : 'border.default'}
    >
      <Stack gap={1.5}>
        <HStack justify="space-between" align="center" gap={3} minH="26px">
          <HStack gap={1.5} color={featured ? 'accent.premium' : 'text.muted'}>
            {featured ? <LuSparkles size={16} aria-hidden /> : null}
            <Heading as="h3" textStyle="label-md" fontSize="sm" color="inherit">
              {title}
            </Heading>
          </HStack>
          {current ? (
            <Badge variant="success" px={3} py={1}>
              {yourPlan}
            </Badge>
          ) : null}
        </HStack>
        <Text textStyle="text-sm" color="text.muted">
          {subtitle}
        </Text>
      </Stack>
      <Stack gap={1.5}>
        <HStack gap={2} align="baseline" flexWrap="wrap">
          <Text
            textStyle="heading-xl"
            {...sdlFigure}
            color="text.default"
            textWrap="balance"
          >
            {amount}
          </Text>
          {suffix ? (
            <Text fontSize="md" fontWeight={500} color="text.muted">
              {suffix}
            </Text>
          ) : null}
        </HStack>
        {note ? (
          <Text textStyle="text-sm" color="text.muted">
            {note}
          </Text>
        ) : null}
      </Stack>
      <List.Root
        gap={3}
        ps={0}
        pt={5}
        listStyle="none"
        borderTopWidth="1px"
        borderColor="border.default"
      >
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
              h="21px"
              color="accent.active"
              flexShrink={0}
              aria-hidden
            >
              <LuCheck size={16} strokeWidth={2.5} />
            </Box>
            <Text as="span" textStyle="text-sm">
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
    </Box>
  )
}

/**
 * Free and Slashie Unlimited side by side (stacked on phones), rendered from
 * the view's config: which card is "Your plan", whether Unlimited leads with
 * the trial, and each card's button. Prices and trial come from the API. The
 * store purchases note sits under the cards, the same for every view. The
 * cards fill the column they are in (the page's section sets its width) and
 * stand at one height.
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
    <Stack gap={4} w="full">
      <Grid
        templateColumns={{
          base: 'minmax(0, 1fr)',
          md: 'repeat(2, minmax(0, 1fr))',
        }}
        gap={{ base: 4, md: 5 }}
        w="full"
      >
        <PlanCard
          data-pricing-plan="free"
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
          data-pricing-plan="unlimited"
          featured
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
      <Text textStyle="text-sm" color="text.muted" maxW="60ch">
        {copy.purchasesNote}
      </Text>
    </Stack>
  )
}
