'use client'

import {
  HStack,
  Heading,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'

import type { WorkerMembershipSnapshot } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import {
  pricingDisplayPrice,
  pricingIntervalLabel,
  pricingTrialLength,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import type { PricingRecord } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Card } from '@ui'

import bag from '../../i11n.json'
import type { BillingAction, BillingDate, BillingViewConfig } from '../../views'
import { BillingQuoteMeter } from './BillingQuoteMeter'

export type BillingPlanCardProps = {
  config: BillingViewConfig
  membership: WorkerMembershipSnapshot | null
  pricing: PricingRecord | null
  /** Formats a membership date in the page's language. */
  formatDate: (value: string | null | undefined) => string | null
  /** When the free allowance resets (formatted). */
  resetsOn: string | null
  actionLoading: boolean
  onAction: (action: BillingAction) => void
}

function membershipDate(
  membership: WorkerMembershipSnapshot | null,
  date: BillingDate,
): string | null {
  if (!membership) return null
  if (date === 'periodEnd') {
    return membership.currentPeriodEnd ?? membership.trialEndsAt ?? null
  }
  return membership[date] ?? null
}

/** The price line: the trial then the price, or the price on its own. */
function PriceLine({
  line,
  pricing,
}: {
  line: NonNullable<BillingViewConfig['price']>
  pricing: PricingRecord | null
}) {
  const t = useI11n(bag).views
  if (line === 'loading') return <Skeleton h="5" w="60%" borderRadius="md" />
  if (!pricing) return null
  const vars = {
    price: pricingDisplayPrice(pricing),
    interval: pricingIntervalLabel(pricing.priceInterval, t.intervals),
  }
  const trial = pricingTrialLength(pricing.trialDays)
  const text =
    line === 'trialThenPrice' && trial
      ? formatMessage(t.price.trialThenPrice, {
          ...vars,
          trial: formatMessage(t.trial[trial.unit], { count: trial.count }),
        })
      : formatMessage(
          line === 'thenPrice' ? t.price.thenPrice : t.price.price,
          vars,
        )
  return (
    <Text fontSize="sm" color="text.muted">
      {text}
    </Text>
  )
}

/**
 * The one plan card, rendered from the view: title and badge, one sentence
 * with the date that matters, the free quota meter when it applies, the
 * price, and the one button.
 */
export function BillingPlanCard({
  config,
  membership,
  pricing,
  formatDate,
  resetsOn,
  actionLoading,
  onAction,
}: BillingPlanCardProps) {
  const t = useI11n(bag).views
  const date = config.date
    ? formatDate(membershipDate(membership, config.date))
    : null
  const bodies: Record<string, string> = t.bodies
  const body = config.date
    ? date
      ? formatMessage(bodies[config.body], { date })
      : bodies[`${config.body}NoDate`]
    : formatMessage(bodies[config.body], {
        count: membership?.freeQuotesPerMonth ?? 0,
      })

  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={5}>
        <HStack justify="space-between" align="flex-start" gap={3}>
          <Heading as="h2" fontSize="lg">
            {t.titles[config.title]}
          </Heading>
          {config.badge ? (
            <Badge variant={config.badge.tone} dot shape="pill">
              {t.badges[config.badge.label]}
            </Badge>
          ) : null}
        </HStack>

        <HStack gap={3} align="flex-start">
          {config.busy ? <Spinner size="sm" mt={0.5} /> : null}
          <Text color="text.default" role={config.busy ? 'status' : undefined}>
            {body}
          </Text>
        </HStack>

        {config.meter && membership ? (
          <BillingQuoteMeter
            used={membership.quotesUsedThisMonth}
            total={membership.freeQuotesPerMonth}
            resetsOn={resetsOn}
          />
        ) : null}

        {config.price || config.action ? (
          <Stack gap={2} align={{ base: 'stretch', sm: 'flex-start' }}>
            {config.action ? (
              <Button
                type="button"
                minH="44px"
                loading={actionLoading}
                onClick={() => onAction(config.action as BillingAction)}
              >
                {t.actions[config.action]}
              </Button>
            ) : null}
            {config.price ? (
              <PriceLine line={config.price} pricing={pricing} />
            ) : null}
            {config.cancelAnytime ? (
              <Text fontSize="xs" color="text.muted">
                {t.cancelAnytime}
              </Text>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
