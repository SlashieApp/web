import { Box, HStack, List, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { Reveal } from '../Reveal'

/**
 * A point's vertical padding. Cells touch the section rules, so this is the
 * section's own rhythm, a step tighter than the frame's `SECTION_PY` because
 * the section is one line of reassurance, not a story: 40px on a phone up to
 * 64px on a wide screen, a step tighter where the points stack.
 */
export const TRUST_CELL_PY = { base: 5, md: 8, lg: 12, xl: 16 } as const

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
 * allowed are the how-it-works index's labels. The points are a plain list; a
 * heading (and so a named landmark) needs a string first.
 */
export function TrustSection({ points }: { points: readonly string[] }) {
  return (
    <Box as="section" data-trust="" bg="bg.surface">
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
            py={TRUST_CELL_PY}
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
