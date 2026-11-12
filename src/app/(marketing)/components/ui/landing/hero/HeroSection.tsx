import { Box, HStack, Heading, List, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCheck } from 'react-icons/lu'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { sdlMotion } from '@/theme/styles'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'
import { PageContainer } from '@/ui/PageContainer'
import { APP_HOME } from '@/utils/appRoutes'
import { Link } from '@ui'

import type { LandingSession } from '../sections/landingCtaPath'
import { HeroTaskCta } from './HeroTaskCta'

/**
 * CSS entrance (runs without JS; disabled under reduced motion): a fade with an
 * 8px rise, 400ms on the decelerate curve, once, the same as `Reveal`.
 */
export function riseIn(delayMs: number) {
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
 * The scene's entrance: a fade, 400ms, once, after the copy (no rise: a
 * moving box would carry the scene's small text across half pixels). Runs
 * without JS; disabled under reduced motion.
 */
function fadeIn(delayMs: number) {
  return {
    animationName: 'fade-in',
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
 * Padding under the hero's last line, above the scene: 24px on a phone and 32
 * from a tablet. The scene keeps a gutter of its own above its window (16px on
 * a phone, 44 on a desktop), so the product sits 40px under the copy on a
 * phone and 76 on a desktop: one group, the answer to the line above it.
 * Without a scene the hero closes with the old foot, `HERO_PB_BARE`.
 */
export const HERO_PB = { base: 6, md: 8 } as const

/** The hero's foot when there is no scene under the copy: 56, 64, 80, 96px. */
export const HERO_PB_BARE = { base: 14, md: 16, lg: 20, xl: 24 } as const

/**
 * The faint radial grey at the top of the page: `bg.subtle` at the top edge
 * fading to nothing, so it has no seam under the header or at the hero's foot.
 */
export const HERO_GLOW =
  'radial-gradient(ellipse 62% 100% at 50% 0%, {colors.bg.subtle} 0%, transparent 100%)'

type HeroSectionCopy = {
  heading: string
  body: string
  taskPlaceholder: string
  taskAriaLabel: string
  /** The line for a worker, ahead of the Browse tasks link. */
  workerPrompt: string
  trustChips: readonly string[]
}

type HeroSectionProps = {
  copy: HeroSectionCopy
  ctas: {
    postTask: string
    browseTasks: string
  }
  /** The scene under the copy: the product doing its job (`HeroStage`). */
  stage?: ReactNode
  /** A visitor with a session skips sign-up on Post a task. Default: a guest. */
  session?: LandingSession
}

/**
 * The hero, the one centred section (tone refresh, train 2; the scene and the
 * action are FE-542): the h1 in `display-2xl`, the body in `text-lg` muted,
 * the 52px pill that asks what you need done with the green Post a task pill
 * inside, a trust row with green 600 checks, and a quiet line for a worker
 * ("Looking for work? Browse tasks", to the public search). A faint radial
 * grey sits behind it at the top of the page.
 *
 * The scene sits under the copy, in the page column, and runs down to the
 * section's foot: the rule under the hero is the edge its window runs off, so
 * the product reads as part of the page and not as a picture on a plate.
 * `data-landing-hero` is the hook the floating "Post a task" pill watches: it
 * shows once this section, scene included, has scrolled out of view.
 */
export function HeroSection({
  copy,
  ctas,
  stage,
  session = 'guest',
}: HeroSectionProps) {
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
        // Under the copy and the scene.
        zIndex={-2}
        pointerEvents="none"
        bgImage={HERO_GLOW}
      />
      <PageContainer>
        <Stack
          align="center"
          textAlign="center"
          gap={{ base: 5, md: 6 }}
          pt={SECTION_PY}
          pb={stage ? HERO_PB : HERO_PB_BARE}
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
            <HeroTaskCta
              placeholder={copy.taskPlaceholder}
              submitLabel={ctas.postTask}
              ariaLabel={copy.taskAriaLabel}
              session={session}
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

          <HStack gap={0} justify="center" textStyle="text-sm" {...riseIn(240)}>
            <Text as="span" color="text.muted">
              {copy.workerPrompt}
            </Text>
            {/* The line of text is 20px tall, too small to tap: the link is a
                44px target and gives the 24px back as a negative margin, so
                it takes a 20px line's room in the hero's rhythm. */}
            <Link
              href={APP_HOME}
              display="inline-flex"
              alignItems="center"
              minH="44px"
              px={2}
              my="-12px"
              fontWeight={500}
              textUnderlineOffset="4px"
              textDecorationThickness="1px"
            >
              {ctas.browseTasks}
            </Link>
          </HStack>
        </Stack>
        {stage ? <Box {...fadeIn(300)}>{stage}</Box> : null}
      </PageContainer>
    </Box>
  )
}
