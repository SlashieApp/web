import { Box, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

import { Magnetic } from '../Magnetic'
import { HeroCanvasLayer } from './HeroCanvasLayer'
import { HeroCursorGlow } from './HeroCursorGlow'
import { HeroPoster } from './HeroPoster'

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

const TRUST_ROW = [
  'No platform job fee',
  'Verified workers',
  'Payment stays between you',
] as const

/**
 * Immersive hero: server-rendered copy over the living-map WebGL layer.
 * The section slides under the transparent marketing header (negative top
 * margin equal to the header height), on the SDL inverted ink surface.
 */
export function HeroSection() {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg="bg.inverted"
      color="text.onInverted"
      mt={{ base: '-56px', md: '-64px' }}
    >
      <HeroPoster />
      <HeroCanvasLayer />
      {/* Legibility scrim above the scene, below the copy. Decorative rgba of
          the bg.inverted ink (#0C1310), like the auth-page treatments. */}
      <Box
        position="absolute"
        inset={0}
        aria-hidden
        pointerEvents="none"
        bgImage="linear-gradient(100deg, rgba(12, 19, 16, 0.82) 0%, rgba(12, 19, 16, 0.5) 42%, rgba(12, 19, 16, 0) 70%), linear-gradient(0deg, rgba(12, 19, 16, 0.5) 0%, rgba(12, 19, 16, 0) 24%)"
      />
      <HeroCursorGlow />

      <Container
        maxW="6xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <Stack
          minH={{ base: '100svh', md: '100vh' }}
          justify="center"
          py={{ base: '96px', md: '120px' }}
          maxW="3xl"
          gap={{ base: 6, md: 8 }}
        >
          <HStack gap={2.5} {...riseIn(0)}>
            <Box
              boxSize="8px"
              borderRadius="full"
              bg="action.primary"
              aria-hidden
            />
            <Text
              fontSize="xs"
              fontWeight={600}
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="text.onInvertedMuted"
            >
              Map-first local task marketplace
            </Text>
          </HStack>

          <Heading
            as="h1"
            fontFamily="display"
            fontWeight={700}
            lineHeight={1.08}
            letterSpacing="-0.02em"
            fontSize="clamp(2.5rem, 6.5vw, 4.5rem)"
            {...riseIn(80)}
          >
            Post a task. Compare local quotes.{' '}
            <Box as="span" color="text.onInvertedLink">
              Pay the worker directly.
            </Box>
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight={1.55}
            color="text.onInvertedMuted"
            maxW="65ch"
            {...riseIn(160)}
          >
            Slashie puts real local tasks on a map. Nearby workers send you
            priced quotes, you choose who to hire, and payment stays between the
            two of you — Slashie never takes a cut of the job.
          </Text>

          <HStack gap={4} flexWrap="wrap" {...riseIn(240)}>
            <Magnetic>
              <NextLink href="/register" style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="primary">
                  Get started
                </Button>
              </NextLink>
            </Magnetic>
            <NextLink href="#how-it-works" style={{ textDecoration: 'none' }}>
              <Button
                size="lg"
                variant="ghost"
                color="text.onInverted"
                borderWidth="1px"
                borderColor="border.glass"
                _hover={{ bg: 'bg.glass', color: 'text.onInverted' }}
              >
                See how it works
              </Button>
            </NextLink>
          </HStack>

          <HStack
            gap={3}
            flexWrap="wrap"
            fontSize="sm"
            color="text.onInvertedMuted"
            {...riseIn(320)}
          >
            {TRUST_ROW.map((item, index) => (
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
      </Container>
    </Box>
  )
}
