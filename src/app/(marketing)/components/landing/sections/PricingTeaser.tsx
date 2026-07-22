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

import type { Messages } from '@/i18n/getDictionary'
import { Button } from '@ui'

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

type PricingTeaserProps = {
  ctas: Messages['common']['ctas']
  messages: Messages['landing']['pricingTeaser']
  pricing: LandingPricing
}

/**
 * Pricing teaser. The worker subscription is the product's single premium
 * layer — and the ONLY place plum (`accent.premium`) appears on the landing.
 */
export function PricingTeaser({ ctas, messages, pricing }: PricingTeaserProps) {
  return (
    <Box as="section" bg="bg.canvas" py={{ base: 16, md: 24 }}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <Stack gap={{ base: 8, md: 10 }} align="center">
          <Reveal>
            <Stack gap={3} textAlign="center" align="center">
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: '28px', md: '36px' }}
                letterSpacing="-0.01em"
              >
                {messages.heading}
              </Heading>
              <Text color="text.muted" maxW="65ch">
                {messages.body}
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
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="border.default"
                textAlign="center"
                align="center"
              >
                <Text fontSize="sm" fontWeight={700} color="text.muted">
                  {messages.freePlanLabel}
                </Text>
                <Heading as="h3" fontSize="24px" fontWeight={600}>
                  {pricing.freeHeadline}
                </Heading>
                <Text fontSize="sm" color="text.muted">
                  {messages.freeBody}
                </Text>
              </Stack>
            </Reveal>

            <Reveal delayMs={120} h="full">
              <Stack
                gap={3}
                h="full"
                p={{ base: 5, md: 6 }}
                bg="bg.surface"
                borderRadius="2xl"
                borderWidth="2px"
                borderColor="accent.premium"
                textAlign="center"
                align="center"
                position="relative"
              >
                <HStack gap={1.5} color="accent.premium" fontWeight={700}>
                  <LuSparkles size={16} aria-hidden />
                  <Text fontSize="sm">{pricing.productName}</Text>
                </HStack>
                <Heading as="h3" fontSize="24px" fontWeight={600}>
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
              <NextLink href="/pricing">{ctas.viewPricing}</NextLink>
            </Button>
          </Reveal>
        </Stack>
      </Container>
    </Box>
  )
}
