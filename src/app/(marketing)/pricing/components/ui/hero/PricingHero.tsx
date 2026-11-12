import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import {
  HERO_GLOW,
  HERO_PB_BARE,
  riseIn,
} from '@/app/(marketing)/components/ui/landing/hero/HeroSection'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'
import { PageContainer } from '@/ui/PageContainer'

/** The hero's heading id: the page's h1, which names the plans landmark. */
export const PRICING_HERO_HEADING_ID = 'pricing-hero-heading'

/**
 * The top of the pricing page, built like Home's hero (FE-552): the faint
 * radial grey under the header, the h1 in `display-2xl` and the body in
 * `text-lg` muted, centred and rising in as Home's do. The plans follow
 * straight under the copy, in the same section: on this page the plans are
 * the answer to the headline, as the post field is on Home, so the prices
 * stay above the fold.
 */
export function PricingHero({
  copy,
  children,
}: {
  copy: { heading: string; body: string }
  /** The plan cards (or the "Pricing isn't loading" card). */
  children: ReactNode
}) {
  return (
    <Box
      as="section"
      data-pricing-hero=""
      data-pricing-plans-section=""
      position="relative"
      aria-labelledby={PRICING_HERO_HEADING_ID}
    >
      <Box
        aria-hidden
        position="absolute"
        top={{
          base: `-${HEADER_MIN_HEIGHT.base}`,
          md: `-${HEADER_MIN_HEIGHT.md}`,
        }}
        left={0}
        right={0}
        bottom={0}
        zIndex={-2}
        pointerEvents="none"
        bgImage={HERO_GLOW}
      />
      <PageContainer>
        <Stack
          gap={{ base: 10, md: 14 }}
          pt={SECTION_PY}
          pb={HERO_PB_BARE}
          mx="auto"
          maxW="64rem"
        >
          <Stack
            align="center"
            textAlign="center"
            gap={{ base: 5, md: 6 }}
            mx="auto"
            maxW="54rem"
          >
            <Heading
              as="h1"
              id={PRICING_HERO_HEADING_ID}
              textStyle="display-2xl"
              textWrap="balance"
              {...riseIn(0)}
            >
              {copy.heading}
            </Heading>
            <Text
              textStyle="text-lg"
              color="text.muted"
              textWrap="balance"
              maxW="56ch"
              {...riseIn(60)}
            >
              {copy.body}
            </Text>
          </Stack>
          <Box minW={0} {...riseIn(120)}>
            {children}
          </Box>
        </Stack>
      </PageContainer>
    </Box>
  )
}
