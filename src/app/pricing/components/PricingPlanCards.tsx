'use client'

import { Box, Grid, Heading, Link, List, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Badge, Button } from '@ui'

import {
  formatPricingInterval,
  pricingAfterTrialLine,
  pricingDisplayPrice,
} from '../helpers/formatPricing'
import type { PricingRecord } from '../helpers/getPricingForPage'
import { resolveFreePlanCta } from '../helpers/pricingCta'
import { PricingUnlimitedCta } from './PricingUnlimitedCta'

type PricingPlanCardsProps = {
  pricing: PricingRecord
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <List.Item display="flex" gap={2} alignItems="flex-start">
      <Box
        as="span"
        color="primary.600"
        fontWeight={800}
        lineHeight="1.4"
        aria-hidden
      >
        ✓
      </Box>
      <Text as="span" fontSize="sm" color="cardFg" lineHeight="tall">
        {children}
      </Text>
    </List.Item>
  )
}

export function PricingPlanCards({ pricing }: PricingPlanCardsProps) {
  const freeCta = resolveFreePlanCta()
  const trialLabel = pricing.trialLabel?.trim()
  const interval = formatPricingInterval(pricing.priceInterval)

  return (
    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} w="full">
      <Box
        borderWidth="1px"
        borderColor="cardBorder"
        borderRadius="2xl"
        bg="cardBg"
        p={{ base: 5, md: 6 }}
        boxShadow="sm"
        h="full"
      >
        <Stack gap={5} h="full">
          <Stack gap={2}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="formLabelMuted"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              Free
            </Text>
            <Heading size="md">Worker — Free tier</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Quote on local tasks with a monthly allowance.
            </Text>
          </Stack>
          <Text fontSize="3xl" fontWeight={800} color="cardFg" lineHeight="1">
            £0
          </Text>
          <List.Root gap={2.5} ps={0} style={{ listStyle: 'none' }}>
            <PlanFeature>
              {pricing.freeQuotesPerMonth} quotes per UTC month
            </PlanFeature>
            <PlanFeature>Browse open tasks on the map</PlanFeature>
            <PlanFeature>Send quotes until your monthly cap</PlanFeature>
            <PlanFeature>Build your worker profile and reputation</PlanFeature>
          </List.Root>
          <Stack gap={2} mt="auto">
            <Link
              as={NextLink}
              href={freeCta.href}
              _hover={{ textDecoration: 'none' }}
            >
              <Button w="full" variant="secondary">
                {freeCta.label}
              </Button>
            </Link>
            <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
              <Button w="full" variant="ghost">
                Browse tasks
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Box>

      <Box
        borderWidth="2px"
        borderColor="primary.400"
        borderRadius="2xl"
        bg="cardBg"
        p={{ base: 5, md: 6 }}
        boxShadow="md"
        position="relative"
        h="full"
      >
        {trialLabel ? (
          <Badge
            position="absolute"
            top={4}
            right={4}
            bg="primary.100"
            color="primary.800"
            fontWeight={700}
          >
            {trialLabel}
          </Badge>
        ) : null}
        <Stack gap={5} h="full">
          <Stack gap={2} pe={{ base: 0, md: trialLabel ? 24 : 0 }}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="primary.700"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              Recommended
            </Text>
            <Heading size="md">{pricing.productName}</Heading>
            {pricing.description?.trim() ? (
              <Text fontSize="sm" color="formLabelMuted">
                {pricing.description.trim()}
              </Text>
            ) : (
              <Text fontSize="sm" color="formLabelMuted">
                Unlimited quoting for active workers on Slashie.
              </Text>
            )}
          </Stack>
          <Stack gap={0}>
            <Text
              fontSize="3xl"
              fontWeight={800}
              color="primary.700"
              lineHeight="1"
            >
              {trialLabel || 'Free trial'}
            </Text>
            <Text fontSize="sm" color="formLabelMuted" mt={2}>
              {pricingAfterTrialLine(pricing)}
            </Text>
            <Text fontSize="xs" color="formLabelMuted" mt={1}>
              Then {pricingDisplayPrice(pricing)} per {interval} unless you
              cancel
            </Text>
          </Stack>
          <List.Root gap={2.5} ps={0} style={{ listStyle: 'none' }}>
            <PlanFeature>Unlimited quotes while subscribed</PlanFeature>
            <PlanFeature>
              Browse tasks and send quotes without a monthly cap
            </PlanFeature>
            <PlanFeature>
              {trialLabel
                ? `${trialLabel}, then ${pricingDisplayPrice(pricing)}/${interval}`
                : `${pricingDisplayPrice(pricing)}/${interval}`}
            </PlanFeature>
            <PlanFeature>Manage or cancel on your worker plan page</PlanFeature>
          </List.Root>
          <PricingUnlimitedCta />
        </Stack>
      </Box>
    </Grid>
  )
}
