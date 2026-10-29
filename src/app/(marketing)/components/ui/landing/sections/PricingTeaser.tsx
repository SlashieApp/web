import { Box, Container, Grid, HStack, Heading, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { LuSparkles, LuTag } from 'react-icons/lu'

import { sdlCardSurface, sdlFigure } from '@/theme/styles'
import { Button } from '@ui'

import {
  SECTION_PY,
  SectionHead,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import { Reveal } from '../Reveal'

export type LandingPricing = {
  /** e.g. "Slashie Unlimited" */
  productName: string
  /** Premium-card headline: live trial label when one exists, else the price. */
  headline: string
  /** Premium-card supporting line. */
  subline: string
  /** Free-tier headline, sentence case, e.g. "3 quotes a month". */
  freeHeadline: string
}

type PricingTeaserCopy = {
  heading: string
  body: string
  freePlanLabel: string
  freeBody: string
}

/** The section heading's id, which names the landmark. */
export const PRICING_TEASER_HEADING_ID = 'landing-pricing-heading'

/** A plan card's padding: a step roomier from `lg`, where the cards sit beside the head. */
const CARD_P = { base: 5, md: 6, lg: 7 } as const

/**
 * One plan: the card recipe of the product (white, a 1px hairline, `e1`, 12px
 * corners), left-aligned: a label, the headline as an h3 and a muted line. The
 * paid plan swaps the hairline and the label for plum (`accent.premium`), and
 * nothing else changes between the two, so they read as a pair.
 */
function PlanCard({
  label,
  headline,
  body,
  premium = false,
  ...dataAttrs
}: {
  label: string
  headline: string
  body: string
  premium?: boolean
} & Record<`data-${string}`, string>) {
  return (
    <Box
      {...dataAttrs}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={3}
      h="full"
      p={CARD_P}
      textAlign="start"
      {...sdlCardSurface}
      borderColor={premium ? 'accent.premium' : 'border.default'}
    >
      <HStack
        gap={1.5}
        minH="21px"
        color={premium ? 'accent.premium' : 'text.muted'}
      >
        {premium ? <LuSparkles size={16} aria-hidden /> : null}
        <Text as="p" textStyle="label-md" fontSize="sm">
          {label}
        </Text>
      </HStack>
      <Heading
        as="h3"
        textStyle="heading-lg"
        // The headline is a figure ("3 quotes a month", a price, a trial): 600
        // with tabular figures, as the price is on the pricing page's cards.
        {...sdlFigure}
        textWrap="balance"
      >
        {headline}
      </Heading>
      <Text textStyle="text-sm" color="text.muted">
        {body}
      </Text>
    </Box>
  )
}

/**
 * The pricing teaser (tone refresh, train 2, item 6): the worker side of the
 * price in two plain cards, then one pill to the pricing page. The live
 * pricing (trial, price, free quotes) is built in `home/page.tsx` and arrives
 * as `pricing`; this section only sets it.
 *
 * From `lg` the head and the pill sit in a left column and the two cards in
 * the right one; below it the head, the cards (two columns from `md`) and the
 * pill stack, always in that reading order. The section is opaque
 * (`bg.surface`) like the other panels, so a 3D prop never crosses a card.
 *
 * The head has an eyebrow, like the other left-aligned heads: the nav's
 * "Pricing" (`header.nav.pricing`, today's string) with a small green 600 tag
 * icon. That icon is the only green here: it is a state/eyebrow icon, never a
 * fill, and the page's one green action is the hero's and the closing call's.
 *
 * Plum (`accent.premium`) is the worker subscription's colour: its label, its
 * hairline and the pill.
 */
export function PricingTeaser({
  copy,
  eyebrow,
  pricing,
  ctaLabel,
  pricingHref,
}: {
  copy: PricingTeaserCopy
  /** The head's eyebrow: the nav's "Pricing" (`header.nav.pricing`). */
  eyebrow: string
  pricing: LandingPricing
  ctaLabel: string
  pricingHref: string
}) {
  return (
    <Box
      as="section"
      data-pricing-teaser=""
      aria-labelledby={PRICING_TEASER_HEADING_ID}
      bg="bg.surface"
      py={SECTION_PY}
    >
      <Container>
        <Grid
          templateColumns={{
            base: 'minmax(0, 1fr)',
            lg: 'minmax(0, 5fr) minmax(0, 7fr)',
          }}
          // The cards span both rows beside the head and the pill: the head
          // keeps its height and the pill sits right under it.
          templateRows={{ lg: 'auto 1fr' }}
          columnGap={{ lg: 16, xl: 24 }}
          rowGap={{ base: 8, md: 10 }}
          alignItems="start"
        >
          <Reveal gridColumn={{ lg: 1 }} gridRow={{ lg: 1 }}>
            <SectionHead
              icon={LuTag}
              eyebrow={eyebrow}
              heading={copy.heading}
              headingId={PRICING_TEASER_HEADING_ID}
              body={copy.body}
            />
          </Reveal>

          <Grid
            data-pricing-plans=""
            templateColumns={{
              base: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
            }}
            gap={{ base: 4, md: 5 }}
            gridColumn={{ lg: 2 }}
            gridRow={{ lg: '1 / span 2' }}
            w="full"
          >
            <Reveal h="full">
              <PlanCard
                data-pricing-plan="free"
                label={copy.freePlanLabel}
                headline={pricing.freeHeadline}
                body={copy.freeBody}
              />
            </Reveal>
            <Reveal delayMs={120} h="full">
              <PlanCard
                data-pricing-plan="premium"
                premium
                label={pricing.productName}
                headline={pricing.headline}
                body={pricing.subline}
              />
            </Reveal>
          </Grid>

          <Reveal delayMs={160} gridColumn={{ lg: 1 }} gridRow={{ lg: 2 }}>
            <Button asChild variant="premium">
              <NextLink href={pricingHref}>{ctaLabel}</NextLink>
            </Button>
          </Reveal>
        </Grid>
      </Container>
    </Box>
  )
}
