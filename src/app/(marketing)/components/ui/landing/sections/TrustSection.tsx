import { Box, HStack, List, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { Reveal } from '../Reveal'

/** The padding between two points that sit above one another: 20px stacked, 32 in the 2 x 2 grid. */
const INNER_PY = { base: 5, md: 8 } as const

/**
 * A point's vertical padding. Cells touch the section rules (so the dividers
 * run from rule to rule), which makes a cell's padding the section's own. The
 * section's edges take the frame's rhythm, `SECTION_PY` (56px on a phone, 80 on
 * a tablet, 96 on a laptop, 128 on a wide screen), as every other section
 * does; the padding between two points that sit above one another is tighter
 * (20px stacked, 32px in the 2 x 2 grid), so four lines of reassurance do not
 * become a block of white. From `lg`, where the four sit in one row, every
 * cell is `SECTION_PY`.
 *
 * `index` is the point's place and `count` how many there are.
 */
export function trustCellPadding(index: number, count: number) {
  const row = Math.floor(index / 2)
  const lastRow = Math.floor((count - 1) / 2)
  return {
    pt: {
      base: index === 0 ? SECTION_PY.base : INNER_PY.base,
      md: row === 0 ? SECTION_PY.md : INNER_PY.md,
      lg: SECTION_PY.lg,
      xl: SECTION_PY.xl,
    },
    pb: {
      base: index === count - 1 ? SECTION_PY.base : INNER_PY.base,
      md: row === lastRow ? SECTION_PY.md : INNER_PY.md,
      lg: SECTION_PY.lg,
      xl: SECTION_PY.xl,
    },
  } as const
}

/**
 * The trust row (tone refresh, train 2, item 5): the four reassurance points
 * as a hairline row, each a green 600 check and the point at 500 in ink. No
 * card, no tint: the section sits on the page between two section rules.
 *
 * From `lg` the four points sit side by side between the frame's rails,
 * divided by 1px `border.default` lines that run from rule to rule (none
 * before the first: the rail is on that edge). On a tablet they flow into two
 * columns with a hairline between the columns and the rows; on a phone they
 * stack with a hairline between them.
 *
 * The section is opaque (`bg.surface`), like the map panel and the bento: the
 * 3D scene stays behind it, so a prop never crosses a point.
 *
 * It has no head of its own: the strings are today's, and the only new ones
 * allowed are the how-it-works index's labels. The points are a plain list, and
 * the wrapper is a `div`, not a `section`: a landmark needs a name and a name
 * needs a string (no existing one fits), and an unnamed `section` claims a
 * structure it cannot have. The spec's "each section is a landmark with a
 * heading" therefore does not hold here until a heading string is allowed.
 */
export function TrustSection({ points }: { points: readonly string[] }) {
  return (
    <Box data-trust="" bg="bg.surface">
      <List.Root
        maxW={PAGE_CONTAINER_MAX_W}
        mx="auto"
        ps={0}
        listStyle="none"
        display="grid"
        gridTemplateColumns={{
          base: 'minmax(0, 1fr)',
          md: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        }}
      >
        {points.map((point, index) => (
          <List.Item
            key={point}
            data-trust-point=""
            px={PAGE_GUTTER_X}
            {...trustCellPadding(index, points.length)}
            borderColor="border.default"
            // One column: a line above every point but the first. Two columns:
            // a line above the second row and before the right-hand column.
            // Four: a line before every point but the first.
            borderTopWidth={{
              base: index === 0 ? 0 : '1px',
              md: index < 2 ? 0 : '1px',
              lg: 0,
            }}
            borderInlineStartWidth={{
              base: 0,
              md: index % 2 === 1 ? '1px' : 0,
              lg: index === 0 ? 0 : '1px',
            }}
          >
            <Reveal delayMs={index * 70}>
              <HStack gap={3} align="flex-start">
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  height="24px"
                  color="accent.active"
                  flexShrink={0}
                  aria-hidden
                >
                  <LuCheck size={20} strokeWidth={2.5} />
                </Box>
                <Text textStyle="text-md" fontWeight={500} color="text.default">
                  {point}
                </Text>
              </HStack>
            </Reveal>
          </List.Item>
        ))}
      </List.Root>
    </Box>
  )
}
