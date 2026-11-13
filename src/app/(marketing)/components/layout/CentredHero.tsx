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

/**
 * The top of a marketing page, built like Home's hero (FE-552, FE-554): the
 * faint radial grey under the header, the h1 in `display-2xl` and the body in
 * `text-lg` muted, centred and rising in as Home's do. What the page shows
 * first (Pricing's plans, About's map) follows under the copy in the same
 * section and rises in a beat later. The section is a landmark named by the h1.
 */
export function CentredHero({
  headingId,
  heading,
  body,
  eyebrow,
  note,
  children,
  ...dataAttrs
}: {
  headingId: string
  heading: string
  body: string
  /** A small label over the title (the legal pages' "Legal"). */
  eyebrow?: ReactNode
  /** A small line right under the body (the legal pages' "Last updated"). */
  note?: ReactNode
  /** What the page shows first, under the copy. */
  children?: ReactNode
} & Record<`data-${string}`, string>) {
  return (
    <Box
      as="section"
      position="relative"
      aria-labelledby={headingId}
      {...dataAttrs}
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
            {eyebrow ? (
              <Box data-hero-eyebrow="" {...riseIn(0)}>
                {eyebrow}
              </Box>
            ) : null}
            <Heading
              as="h1"
              id={headingId}
              textStyle="display-2xl"
              textWrap="balance"
              {...riseIn(0)}
            >
              {heading}
            </Heading>
            <Text
              textStyle="text-lg"
              color="text.muted"
              textWrap="balance"
              maxW="56ch"
              {...riseIn(60)}
            >
              {body}
            </Text>
            {note ? (
              <Box data-hero-note="" {...riseIn(60)}>
                {note}
              </Box>
            ) : null}
          </Stack>
          {children ? (
            <Box minW={0} {...riseIn(120)}>
              {children}
            </Box>
          ) : null}
        </Stack>
      </PageContainer>
    </Box>
  )
}
