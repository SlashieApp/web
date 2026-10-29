import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { LuSparkles } from 'react-icons/lu'

import { Button } from '@ui'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { Reveal } from '../Reveal'

export type LandingPricing = {
  /** e.g. "Slashie Unlimited" */
  productName: string
  /** Premium-card headline — live trial label when one exists, else the price. */
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

/**
 * Pricing teaser. The worker subscription is the product's single premium
 * layer — and the ONLY place plum (`accent.premium`) appears on the landing.
 */
export function PricingTeaser({
  copy,
  pricing,
  ctaLabel,
  pricingHref,
}: {
  copy: PricingTeaserCopy
  pricing: LandingPricing
  ctaLabel: string
  pricingHref: string
}) {
  return (
    <Box as="section" py={SECTION_PY}>
      <Container>
        <Stack gap={{ base: 8, md: 10 }} maxW="4xl">
          <Reveal>
            <Stack gap={3}>
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: '28px', md: '36px' }}
                letterSpacing={{ base: '-0.025em', md: '-0.03em' }}
              >
                {copy.heading}
              </Heading>
              <Text color="text.muted" maxW="65ch">
                {copy.body}
              </Text>
            </Stack>
          </Reveal>

          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap={5}
            w="full"
          >
            <Reveal h="full">
              <Stack
                gap={3}
                h="full"
                p={{ base: 5, md: 6 }}
                bg="bg.surface"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="border.default"
                textAlign="center"
                align="center"
              >
                <Text fontSize="sm" fontWeight={500} color="text.muted">
                  {copy.freePlanLabel}
                </Text>
                <Heading
                  as="h3"
                  fontSize="24px"
                  fontWeight={500}
                  letterSpacing="-0.02em"
                >
                  {pricing.freeHeadline}
                </Heading>
                <Text fontSize="sm" color="text.muted">
                  {copy.freeBody}
                </Text>
              </Stack>
            </Reveal>

            <Reveal delayMs={120} h="full">
              <Stack
                gap={3}
                h="full"
                p={{ base: 5, md: 6 }}
                bg="bg.surface"
                borderRadius="lg"
                borderWidth="2px"
                borderColor="accent.premium"
                textAlign="center"
                align="center"
                position="relative"
              >
                <HStack gap={1.5} color="accent.premium" fontWeight={500}>
                  <LuSparkles size={16} aria-hidden />
                  <Text fontSize="sm">{pricing.productName}</Text>
                </HStack>
                <Heading
                  as="h3"
                  fontSize="24px"
                  fontWeight={500}
                  letterSpacing="-0.02em"
                >
                  {pricing.headline}
                </Heading>
                <Text fontSize="sm" color="text.muted">
                  {pricing.subline}
                </Text>
              </Stack>
            </Reveal>
          </Grid>

          <Reveal delayMs={160}>
            <Button asChild variant="premium">
              <NextLink href={pricingHref}>{ctaLabel}</NextLink>
            </Button>
          </Reveal>
        </Stack>
      </Container>
    </Box>
  )
}
