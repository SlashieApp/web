'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

/** Long wash used when the list sits on the viewport’s left edge. */
const LIST_COLUMN_SCRIM =
  'linear-gradient(to right, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.88) 38%, rgba(255, 255, 255, 0.4) 58%, rgba(255, 255, 255, 0) 78%)'

/** Opaque over the list, then gone at the list’s right edge. */
const LIST_END_SCRIM =
  'linear-gradient(to right, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0) 100%)'

/**
 * Desktop map overlay behind the left list/filters column. Sits above the map
 * but below interactive panel content.
 */
export function TaskBrowseListColumnScrim({
  w = 'min(760px, 52vw)',
  fadeToEnd = false,
}: {
  w?: BoxProps['w']
  /** Fade out at this box’s right edge (the task list’s end). */
  fadeToEnd?: boolean
}) {
  return (
    <Box
      position="absolute"
      zIndex={1}
      top={0}
      left={0}
      bottom={0}
      w={w}
      pointerEvents="none"
      aria-hidden
      css={{ background: fadeToEnd ? LIST_END_SCRIM : LIST_COLUMN_SCRIM }}
    />
  )
}
