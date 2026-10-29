import {
  Box,
  type BoxProps,
  HStack,
  Heading,
  Stack,
  type StackProps,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

import { PAGE_CONTAINER_MAX_W } from '@/theme/pageContainer'
import { sdlEyebrow } from '@/theme/styles'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

/**
 * The marketing frame (FE-471, tone train 2): the pieces every marketing
 * section shares so the pages read as one calm, ruled sheet.
 *
 *   - `MarketingFrame`  the page's content column, with a 1px rail down each
 *                       side from `lg`.
 *   - `SectionRule`     a full-width 1px rule between two sections.
 *   - `SectionHead`     the left-aligned head of a section: a small green
 *                       eyebrow icon, the eyebrow, the heading, an optional
 *                       body. Only the hero and the closing call to action
 *                       are centred.
 *   - `SECTION_PY`      the vertical rhythm of a section.
 *
 * The page itself is white (`bg.surface`): the landing's backdrop paints it
 * behind the 3D scene, so the frame is transparent and draws lines only.
 */

/**
 * Vertical padding of a section: 56px on a phone, 80 on a tablet, 96 on a
 * laptop and 128 on a wide screen. Apply it to the section's own box, so the
 * rule above it (a `SectionRule`) sits on the section's edge.
 */
export const SECTION_PY = { base: 14, md: 20, lg: 24, xl: 32 } as const

export type MarketingFrameProps = Omit<BoxProps, 'position'> & {
  /**
   * The rails' stacking order (default 1, under anything that is positioned
   * over the page). A page whose sticky page header paints an opaque bar
   * across the page (the pricing page) raises it above the bar (11) so the
   * rails run unbroken from the site header down. The rails never take a
   * click.
   */
  railsZIndex?: BoxProps['zIndex']
}

/**
 * The content column of a marketing page: from `lg`, a 1px `border.default`
 * rail down each side for the full height of what the frame wraps. The rails
 * sit on the outer edges of the page column (`sizes.page`, the same measure as
 * `<Container>` and the header), so they line up with the header and with
 * every section's content. Below `lg` the column is the screen and there are
 * no rails.
 *
 * The rails start under the sticky header (one header height above the frame),
 * not at its foot, like the landing's hero glow. Over the landing's transparent
 * header at the top of the page they then run in from the screen's edge instead
 * of starting in mid-air; once the header is solid it covers them and they meet
 * its border, as on every other marketing page.
 *
 * Wrap the sections, not the footer: the footer is its own band. Full-bleed
 * panels and `SectionRule`s run under the rails and cross them.
 */
export function MarketingFrame({
  children,
  railsZIndex = 1,
  ...boxProps
}: MarketingFrameProps) {
  return (
    <Box position="relative" {...boxProps}>
      <Box
        aria-hidden
        data-marketing-rails=""
        position="absolute"
        top={{
          base: `-${HEADER_MIN_HEIGHT.base}`,
          md: `-${HEADER_MIN_HEIGHT.md}`,
        }}
        left={0}
        right={0}
        bottom={0}
        zIndex={railsZIndex}
        display={{ base: 'none', lg: 'block' }}
        pointerEvents="none"
      >
        <Box
          mx="auto"
          maxW={PAGE_CONTAINER_MAX_W}
          h="full"
          borderInlineWidth="1px"
          borderColor="border.default"
        />
      </Box>
      {children}
    </Box>
  )
}

/**
 * A full-width 1px `border.default` rule between two sections. It runs edge to
 * edge, across the rails. Decorative: it is hidden from assistive technology
 * (the sections are landmarks with their own headings).
 */
export function SectionRule(props: Omit<BoxProps, 'children'>) {
  return (
    <Box
      aria-hidden
      data-section-rule=""
      h="1px"
      w="full"
      bg="border.default"
      {...props}
    />
  )
}

export type SectionHeadProps = Omit<StackProps, 'children'> & {
  /** The small uppercase label above the heading. */
  eyebrow?: string
  /** A small icon before the eyebrow, drawn in green 600 (never text). */
  icon?: IconType
  heading: string
  /** The heading's id, for the section's `aria-labelledby`. */
  headingId?: string
  /** The heading's level: `h2` for a section, `h3` inside one. */
  level?: 'h1' | 'h2' | 'h3'
  /**
   * The heading's size. `display` (default): 34/41 on a phone, 44/48 from `lg`,
   * the lead of a section on a page of sections. `title`: 34/41 at every width,
   * for a section that sits under a page title of its own (the page header's
   * title is 34/41), so the section's head never out-sizes the page's h1.
   */
  size?: 'display' | 'title'
  /** Supporting line(s) under the heading, in muted text. */
  body?: ReactNode
}

/**
 * The head of a section: left-aligned, an eyebrow (12/16, 500, +0.08em, caps,
 * `text.subtle`) with a small green 600 icon, then the heading (34/41 on a
 * phone, 44/48 from `lg`, 500; 34/41 throughout with `size="title"`), then an
 * optional body. Without an eyebrow it is just the heading and body.
 */
export function SectionHead({
  eyebrow,
  icon: Icon,
  heading,
  headingId,
  level = 'h2',
  size = 'display',
  body,
  ...stackProps
}: SectionHeadProps) {
  return (
    <Stack gap={3} align="flex-start" textAlign="start" {...stackProps}>
      {eyebrow ? (
        <HStack gap={2}>
          {Icon ? (
            <Box
              as="span"
              display="inline-flex"
              color="accent.active"
              flexShrink={0}
              aria-hidden
            >
              <Icon size={16} />
            </Box>
          ) : null}
          <Text as="p" {...sdlEyebrow}>
            {eyebrow}
          </Text>
        </HStack>
      ) : null}
      <Heading
        as={level}
        id={headingId}
        textStyle={
          size === 'title'
            ? 'heading-xl'
            : { base: 'heading-xl', lg: 'display-lg' }
        }
        textWrap="balance"
      >
        {heading}
      </Heading>
      {body ? (
        <Text textStyle="text-lg" color="text.muted" maxW="60ch">
          {body}
        </Text>
      ) : null}
    </Stack>
  )
}
