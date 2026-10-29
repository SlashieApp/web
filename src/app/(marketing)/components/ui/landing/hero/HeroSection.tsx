import { Box, Container, Heading, List, Stack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlMotion } from '@/theme/styles'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { HeroHowItWorksLink } from './HeroHowItWorksLink'
import { HeroSearchCta } from './HeroSearchCta'

/**
 * CSS entrance (runs without JS; disabled under reduced motion): a fade with an
 * 8px rise, 400ms on the decelerate curve, once, the same as `Reveal`.
 */
function riseIn(delayMs: number) {
  return {
    animationName: 'fade-rise',
    animationDuration: '400ms',
    animationTimingFunction: sdlMotion.easing.decelerate,
    animationFillMode: 'backwards',
    animationDelay: `${delayMs}ms`,
    css: {
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
  } as const
}

/**
 * Padding under the hero's last line: 56px on a phone, 64 on a tablet, 80 on a
 * laptop and 96 on a wide screen. The top is the frame's `SECTION_PY` (the h1
 * sits that far under the header); the foot is a step tighter, so the hero's
 * block reads as one group above the rule and the props that sit under the
 * "See how it works" row on a phone keep clear of the rule.
 */
export const HERO_PB = { base: 14, md: 16, lg: 20, xl: 24 } as const

/**
 * The faint radial grey at the top of the page: `bg.subtle` at the top edge
 * fading to nothing, so it has no seam under the header or at the hero's foot.
 */
const HERO_GLOW =
  'radial-gradient(ellipse 62% 100% at 50% 0%, {colors.bg.subtle} 0%, transparent 100%)'

type HeroSectionCopy = {
  heading: string
  body: string
  searchPlaceholder: string
  searchSubmit: string
  searchAriaLabel: string
  trustChips: readonly string[]
}

type HeroSectionProps = {
  copy: HeroSectionCopy
  ctas: {
    seeHowItWorks: string
  }
}

/**
 * The hero, the one centred section (tone refresh, train 2): the h1 in
 * `display-2xl`, the body in `text-lg` muted, the 52px search pill with the
 * green Search pill inside, a trust row with green 600 checks, and the
 * "See how it works" text link. A faint radial grey sits behind it at the top
 * of the page. The demo phone sits just below it (pinned layer on desktop,
 * inline on phones) and the 3D objects float around both. `data-landing-hero`
 * is the hook the floating "Post a task" pill watches: it shows once this
 * section has scrolled out of view.
 */
export function HeroSection({ copy, ctas }: HeroSectionProps) {
  return (
    <Box
      as="section"
      data-landing-hero=""
      position="relative"
      aria-labelledby="landing-hero-heading"
    >
      <Box
        aria-hidden
        data-hero-glow=""
        position="absolute"
        // Starts under the sticky header, so the grey has no seam beneath it.
        top={{
          base: `-${HEADER_MIN_HEIGHT.base}`,
          md: `-${HEADER_MIN_HEIGHT.md}`,
        }}
        left={0}
        right={0}
        bottom={0}
        // Under the still poster (-1) and the copy.
        zIndex={-2}
        pointerEvents="none"
        bgImage={HERO_GLOW}
      />
      <Container maxW={PAGE_CONTAINER_MAX_W} px={PAGE_GUTTER_X}>
        <Stack
          align="center"
          textAlign="center"
          gap={{ base: 5, md: 6 }}
          pt={SECTION_PY}
          pb={HERO_PB}
          mx="auto"
          maxW="54rem"
        >
          <Heading
            as="h1"
            id="landing-hero-heading"
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

          <Box
            w="full"
            display="flex"
            justifyContent="center"
            pt={{ base: 1, md: 2 }}
            {...riseIn(120)}
          >
            <HeroSearchCta
              placeholder={copy.searchPlaceholder}
              submitLabel={copy.searchSubmit}
              ariaLabel={copy.searchAriaLabel}
            />
          </Box>

          <List.Root
            ps={0}
            listStyle="none"
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            justifyContent="center"
            columnGap={{ base: 4, md: 6 }}
            rowGap={2}
            {...riseIn(180)}
          >
            {copy.trustChips.map((item) => (
              <List.Item
                key={item}
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Box
                  as="span"
                  display="inline-flex"
                  color="accent.active"
                  flexShrink={0}
                  aria-hidden
                >
                  <LuCheck size={16} strokeWidth={2.5} />
                </Box>
                <Text as="span" textStyle="text-sm" color="text.muted">
                  {item}
                </Text>
              </List.Item>
            ))}
          </List.Root>

          <Box {...riseIn(240)}>
            <HeroHowItWorksLink>{ctas.seeHowItWorks}</HeroHowItWorksLink>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
