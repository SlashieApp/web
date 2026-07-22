import { Box, Flex, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'

import { HeroPoster } from './HeroPoster'
import { HeroSearchCta } from './HeroSearchCta'
import { HeroSplineLayer } from './HeroSplineLayer'
import { Spotlight } from './Spotlight'

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
 * Marketing hero: brand-first split composition — copy + search CTA on the
 * left, Spotlight + lazy Spline 3D human on the right. Slides under the
 * transparent marketing header (negative top margin = header height).
 */
export function HeroSection({ copy, ctas }: HeroSectionProps) {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg="bg.inverted"
      color="text.onInverted"
      mt={{ base: '-56px', md: '-64px' }}
    >
      <Spotlight />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="stretch"
        minH={{ base: '100svh', md: '100vh' }}
        position="relative"
        zIndex={1}
      >
        <Flex
          flex="1 1 50%"
          direction="column"
          justify="center"
          px={{ base: 4, md: 8, lg: 12 }}
          pt={{ base: '96px', md: '120px' }}
          pb={{ base: 8, md: '120px' }}
          maxW={{ md: '50%' }}
        >
          <Stack gap={{ base: 5, md: 7 }} maxW="34rem">
            <Box {...riseIn(0)}>
              <Image
                src="/images/slashie-logo-dark.png"
                alt="slashie"
                h={{ base: '40px', md: '52px' }}
                w="auto"
                maxW={{ base: '180px', md: '240px' }}
                objectFit="contain"
              />
            </Box>

            <Heading
              as="h1"
              fontFamily="display"
              fontWeight={700}
              lineHeight={1.08}
              letterSpacing="-0.02em"
              fontSize="clamp(2.25rem, 5.5vw, 3.75rem)"
              {...riseIn(80)}
            >
              {copy.heading}
            </Heading>

            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight={1.55}
              color="text.onInvertedMuted"
              maxW="40ch"
              {...riseIn(160)}
            >
              {copy.body}
            </Text>

            <Box {...riseIn(240)}>
              <HeroSearchCta
                placeholder={copy.searchPlaceholder}
                submitLabel={copy.searchSubmit}
                ariaLabel={copy.searchAriaLabel}
              />
            </Box>

            <Text
              fontSize="sm"
              color="text.onInvertedLink"
              fontWeight={500}
              {...riseIn(300)}
            >
              {/* Plain anchor: native CSS smooth scroll — NextLink fights Lenis. */}
              <Box
                as="a"
                href="#how-it-works"
                textDecoration="underline"
                textUnderlineOffset="3px"
                _hover={{ color: 'action.primary' }}
                _focusVisible={{
                  outline: '2px solid',
                  outlineColor: 'action.primary',
                  outlineOffset: '3px',
                  borderRadius: 'sm',
                }}
              >
                {ctas.seeHowItWorks}
              </Box>
            </Text>

            <HStack
              gap={3}
              flexWrap="wrap"
              fontSize="sm"
              color="text.onInvertedMuted"
              {...riseIn(360)}
            >
              {copy.trustChips.map((item, index) => (
                <HStack key={item} gap={3}>
                  {index > 0 ? (
                    <Box
                      boxSize="3px"
                      borderRadius="full"
                      bg="text.onInvertedMuted"
                      aria-hidden
                    />
                  ) : null}
                  <Text>{item}</Text>
                </HStack>
              ))}
            </HStack>
          </Stack>
        </Flex>

        <Box
          flex="1 1 50%"
          position="relative"
          minH={{ base: '280px', md: 'auto' }}
          overflow="hidden"
          opacity={{ base: 0.85, md: 1 }}
        >
          <HeroPoster />
          <HeroSplineLayer />
          {/* Soft left fade so copy stays legible where panes meet on desktop. */}
          <Box
            position="absolute"
            insetY={0}
            left={0}
            w={{ base: '0', md: '28%' }}
            pointerEvents="none"
            aria-hidden
            bgImage="linear-gradient(90deg, rgba(12, 19, 16, 0.92) 0%, rgba(12, 19, 16, 0) 100%)"
          />
        </Box>
      </Flex>
    </Box>
  )
}
