import { Box, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { Magnetic } from '../Magnetic'
import { Reveal } from '../Reveal'

type CtaLink = { label: string; href: string }

/** The section heading's id, which names the landmark. */
export const FINAL_CTA_HEADING_ID = 'landing-final-cta-heading'

/**
 * The final call to action (tone refresh, train 2, item 7): a closing beat of
 * one centred line, one sentence and two ways in. Post a task is the green
 * pill (the primary action, green 400 with an ink label); Become a worker is
 * the outline pill (white, a 1px `border.strong` hairline, an ink label). It is
 * the only centred section besides the hero, so it has no eyebrow and no icon:
 * an eyebrow would need a string, and the train allows none.
 *
 * The heading is `display-lg` (44/48 at 500, -0.035em) from `md`, and
 * `heading-xl` (34/41) on a phone, the same step down as `SectionHead`. The
 * section is a landmark named by that heading.
 *
 * Unlike the panels above it, it is transparent: the 3D scene's `gather`
 * formation is this section's beat (the objects gather round the call), so the
 * scene has to show through. The text block is at most 40rem wide and centred;
 * the objects stay clear of it (see the scene's formations).
 *
 * Hrefs come localized.
 */
export function FinalCtaBand({
  copy,
  primary,
  secondary,
}: {
  copy: { heading: string; body: string }
  primary: CtaLink
  secondary: CtaLink
}) {
  return (
    <Box
      as="section"
      data-final-cta=""
      aria-labelledby={FINAL_CTA_HEADING_ID}
      py={SECTION_PY}
    >
      <Container>
        <Stack
          align="center"
          textAlign="center"
          gap={{ base: 8, md: 10 }}
          maxW="40rem"
          mx="auto"
        >
          <Reveal>
            <Stack gap={4} align="center">
              <Heading
                as="h2"
                id={FINAL_CTA_HEADING_ID}
                textStyle={{ base: 'heading-xl', md: 'display-lg' }}
                textWrap="balance"
              >
                {copy.heading}
              </Heading>
              <Text textStyle="text-lg" color="text.muted" textWrap="balance">
                {copy.body}
              </Text>
            </Stack>
          </Reveal>
          <Reveal delayMs={120}>
            <HStack gap={3} flexWrap="wrap" justify="center">
              <Magnetic>
                <Button asChild size="lg" variant="primary">
                  <NextLink href={primary.href}>{primary.label}</NextLink>
                </Button>
              </Magnetic>
              <Button asChild size="lg" variant="secondary">
                <NextLink href={secondary.href}>{secondary.label}</NextLink>
              </Button>
            </HStack>
          </Reveal>
        </Stack>
      </Container>
    </Box>
  )
}
