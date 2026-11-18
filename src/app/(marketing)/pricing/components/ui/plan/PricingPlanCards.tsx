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
import { LuCheck } from 'react-icons/lu'

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
import { PricingPortalButton } from './PricingPortalButton'
import { PricingSyncButton } from './PricingSyncButton'

type PricingCopy = (typeof messages)['en']
export type PricingPlansCopy = PricingCopy['plans']

/** A plan card's padding: 20, 24 and 28px by breakpoint (the teaser's). */
const CARD_P = { base: 5, md: 6, lg: 7 } as const

/**
 * A card's one button, a pill: outline on Free, the green primary on the paid
 * plan. The main action stays Slashie green everywhere, marketing included, one
 * per screen: the paid plan's is the page's (it carries `data-page-green-action`,
 * so the header's Get started is secondary while it is on screen and the green
 * one again when it is not). Plum stays on that card's label, sparkle and
 * hairline, not on its button.
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
  if (action.kind === 'portal') {
    return <PricingPortalButton label={labels[action.label]} />
  }
  if (action.kind === 'sync') {
    return <PricingSyncButton label={labels[action.label]} />
  }
  return (
    <Button
      asChild
      w="full"
      variant={featured ? 'primary' : 'secondary'}
      data-page-green-action={featured ? '' : undefined}
    >
      <Link href={action.href} _hover={{ textDecoration: 'none' }}>
        {labels[action.label]}
      </Link>
    </Button>
  )
}

/**
 * One plan: the card recipe of the product and of the landing's teaser (white,
 * a 1px hairline, `e1`, 12px corners), left-aligned: the plan's name as the
 * card's title (16, 500, ink), its line, the price as a figure (600, tabular)
 * with what follows it in ink (the price after the trial, FE-290) and a muted
 * line under that, a hairline, the features with green 600 checks and a pill.
 * The paid plan's name and hairline are plum (`accent.premium`; no sparkle,
 * FE-290) and its pill is the green primary (the page's main action); nothing
 * else changes between the two, so they read as a pair.
 */
function PlanCard({
  featured = false,
  title,
  subtitle,
  amount,
  suffix,
  note,
  detail,
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
  /** Right under the figure, in ink: "Then £19.99 / month". */
  note?: string
  /** Under that, muted: "Card needed to start", or a state's sentence. */
  detail?: string
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
        {/* The "Your plan" badge is 28px tall: every card's row is, so the titles line up. */}
        <HStack justify="space-between" align="center" gap={3} minH="28px">
          <Heading
            as="h3"
            fontSize="md"
            lineHeight="24px"
            fontWeight={500}
            color={featured ? 'accent.premium' : 'text.default'}
          >
            {title}
          </Heading>
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
          <Text fontSize="md" fontWeight={500} color="text.default">
            {note}
          </Text>
        ) : null}
        {detail ? (
          <Text textStyle="text-sm" color="text.muted">
            {detail}
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
 * Free and Slashie Pro side by side (stacked on phones), rendered from
 * the view's config: which card is "Your plan", what the paid card says (the
 * trial, the price, or where the worker's plan stands, in Billing's words) and
 * each card's button. Prices and trial come from the API. The payment note
 * sits under the cards, the same for every view. The cards fill the column
 * they are in (the page's section sets its width) and stand at one height.
 */
export function PricingPlanCards({
  pricing,
  config,
  copy,
  intervals,
  paidDate = null,
}: {
  pricing: PricingRecord
  config: PricingViewConfig
  copy: PricingPlansCopy
  intervals: PricingCopy['intervals']
  /** The date the paid line names (trial end, or when the plan ends), already formatted. */
  paidDate?: string | null
}) {
  // Free has no billing period of its own: it reads per one interval.
  const freePerInterval = pricingPerInterval(
    { priceInterval: pricing.priceInterval, priceIntervalCount: 1 },
    intervals,
  )
  const perInterval = pricingPerInterval(pricing, intervals)
  const price = pricingDisplayPrice(pricing)
  const trial =
    config.paid === 'trial' ? pricingTrialLength(pricing.trialDays) : null
  const count = pricing.freeQuotesPerMonth
  const paid = paidLines(config.paid, {
    copy,
    price,
    perInterval,
    trial,
    priceLine: pricingPriceLine(pricing, intervals),
    date: paidDate,
  })

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
          {...paid}
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

/** The paid card's figure and the lines under it, for the view's `paid` (FE-290). */
function paidLines(
  line: PricingViewConfig['paid'],
  input: {
    copy: PricingPlansCopy
    price: string
    perInterval: string
    trial: ReturnType<typeof pricingTrialLength>
    priceLine: string
    date: string | null
  },
): { amount: string; suffix?: string; note?: string; detail?: string } {
  const { copy, price, perInterval, trial, priceLine, date } = input
  const s = copy.paidStatus
  const priced = { amount: price, suffix: perInterval }
  switch (line) {
    case 'trial':
      return trial
        ? {
            amount: formatMessage(copy.trial[trial.unit], {
              count: trial.count,
            }),
            note: formatMessage(copy.thenPrice, { priceLine }),
            detail: copy.cardNeeded,
          }
        : priced
    case 'price':
      return priced
    case 'trialing':
      return date
        ? { ...priced, detail: formatMessage(s.trialing, { date }) }
        : priced
    case 'ending':
      return { amount: date ? formatMessage(s.endsOn, { date }) : s.ending }
    case 'given':
      return { amount: s.given, detail: s.givenNote }
    case 'paymentProblem':
      return { amount: s.paymentProblem, detail: s.paymentProblemNote }
    case 'paused':
      return { amount: s.paused, detail: s.pausedNote }
    case 'notFinished':
      return { amount: s.notFinished, detail: s.notFinishedNote }
  }
}
