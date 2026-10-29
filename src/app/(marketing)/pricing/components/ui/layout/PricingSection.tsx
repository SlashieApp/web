import { Box, Container, Grid, type GridProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { Reveal } from '@/app/(marketing)/components/ui/landing/Reveal'

/**
 * The section's grid: one column, and from `xl` the head (4fr) beside the
 * content (8fr). The loading screen sets its skeletons in the same grid.
 */
export const PRICING_SPLIT = {
  templateColumns: {
    base: 'minmax(0, 1fr)',
    xl: 'minmax(0, 4fr) minmax(0, 8fr)',
  },
  columnGap: { xl: 20 },
  rowGap: { base: 8, md: 10 },
  alignItems: 'start',
} as const satisfies GridProps

/**
 * One section of the pricing page (FE-471, tone train 2): a landmark named by
 * its heading, in the page column with the frame's rhythm (`SECTION_PY`).
 *
 * Below `xl` the head sits over the content. From `xl` the head is the left
 * column and the content the right one (4fr and 8fr), the way the landing's
 * pricing teaser sets its head and cards, so every section of the page shares
 * one left edge for its content. The split starts at `xl` and not `lg`: the two
 * plan cards need about 300px each, which the right column only has from there.
 * Either way the DOM order is the head, then the content.
 *
 * The section's rules are the page's (`SectionRule` between sections), not
 * the section's own.
 */
export function PricingSection({
  headingId,
  head,
  children,
  ...dataAttrs
}: {
  /** The id of the heading `head` renders: the landmark's name. */
  headingId: string
  /** A `SectionHead` (its `headingId` is `headingId`). */
  head: ReactNode
  /** What the head introduces. */
  children: ReactNode
} & Record<`data-${string}`, string>) {
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      py={SECTION_PY}
      {...dataAttrs}
    >
      <Container>
        <Grid {...PRICING_SPLIT}>
          <Reveal>{head}</Reveal>
          <Reveal delayMs={80} minW={0}>
            {children}
          </Reveal>
        </Grid>
      </Container>
    </Box>
  )
}
