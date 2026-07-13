'use client'

import { Box } from '@chakra-ui/react'

/** White fade left → right so the browse/search list column reads on the map. */
const LIST_COLUMN_SCRIM =
  'linear-gradient(to right, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.88) 38%, rgba(255, 255, 255, 0.4) 58%, rgba(255, 255, 255, 0) 78%)'

/**
 * Desktop map overlay behind the left list/filters column. Sits above the map
 * but below interactive panel content.
 */
export function TaskBrowseListColumnScrim() {
  return (
    <Box
      position="absolute"
      zIndex={1}
      top={0}
      left={0}
      bottom={0}
      w="min(760px, 52vw)"
      pointerEvents="none"
      aria-hidden
      css={{ background: LIST_COLUMN_SCRIM }}
    />
  )
}
