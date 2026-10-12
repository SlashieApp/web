import { Box, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { HeroHowItWorksLink } from './HeroHowItWorksLink'
import { HeroSearchCta } from './HeroSearchCta'

/** CSS entrance (runs without JS; disabled under reduced motion). */
function riseIn(delayMs: number) {
  return {
    animationName: 'rise-in',
    animationDuration: '0.85s',
    animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
    animationFillMode: 'backwards',
    animationDelay: `${delayMs}ms`,
    css: {
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
  } as const
}

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
 * Hero copy and the search CTA, centred over the mint backdrop. The demo
 * phone sits just below it (pinned layer on desktop, inline on phones) and
 * the 3D objects float around both.
 */
export function HeroSection({ copy, ctas }: HeroSectionProps) {
  return (
    <Box
      as="section"
      position="relative"
      aria-labelledby="landing-hero-heading"
    >
      <Container maxW={PAGE_CONTAINER_MAX_W} px={PAGE_GUTTER_X}>
        <Stack
          align="center"
          textAlign="center"
          gap={{ base: 5, md: 6 }}
          pt={{ base: 10, md: 16 }}
          pb={{ base: 8, md: 10 }}
          mx="auto"
          maxW="54rem"
        >
          <Heading
            as="h1"
            id="landing-hero-heading"
            fontFamily="display"
            fontWeight={800}
            lineHeight={1.05}
            letterSpacing="-0.03em"
            fontSize="clamp(2.5rem, 6vw, 4.5rem)"
            {...riseIn(0)}
          >
            {copy.heading}
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            lineHeight={1.55}
            color="text.muted"
            maxW="36ch"
            {...riseIn(90)}
          >
            {copy.body}
          </Text>

          <Box w="full" display="flex" justifyContent="center" {...riseIn(170)}>
            <HeroSearchCta
              placeholder={copy.searchPlaceholder}
              submitLabel={copy.searchSubmit}
              ariaLabel={copy.searchAriaLabel}
            />
          </Box>

          <HStack
            gap={3}
            flexWrap="wrap"
            justify="center"
            fontSize="sm"
            fontWeight={600}
            color="text.muted"
            {...riseIn(240)}
          >
            {copy.trustChips.map((item, index) => (
              <HStack key={item} gap={3}>
                {index > 0 ? (
                  <Box
                    boxSize="4px"
                    borderRadius="full"
                    bg="action.primary"
                    aria-hidden
                  />
                ) : null}
                <Text>{item}</Text>
              </HStack>
            ))}
          </HStack>

          <Text
            fontSize="sm"
            fontWeight={600}
            color="text.link"
            {...riseIn(300)}
          >
            <HeroHowItWorksLink>{ctas.seeHowItWorks}</HeroHowItWorksLink>
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}
