'use client'

import { Box, Text } from '@chakra-ui/react'

import { sdlMotion } from '@/theme/styles'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskHeaderControls } from './TaskHeaderControls'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

/** Height of the collapsed bar — the mobile tab strip sticks directly below it. */
export const MOBILE_COLLAPSED_HEADER_H = '52px'

/**
 * Mobile (<lg) collapsed header: a compact back · headline · overflow bar that
 * slides in and pins above the Info/Quotes tab strip once the map hero has
 * scrolled away. Implemented as a zero-height sticky layer + absolute bar so it
 * reserves no flow space and never clips its dropdown.
 */
export function TaskDetailMobileCollapsedHeader({
  collapsed,
}: {
  collapsed: boolean
}) {
  const { task, myQuote, isAuthenticated, permissions } = useTaskDetail()

  if (!task) return null

  const { headline } = selectStatusHeaderCopy({
    permissions,
    myQuote,
    isAuthenticated,
    task,
  })

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={15}
      h={0}
      display={{ base: 'block', lg: 'none' }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bg="bg.canvas"
        px={4}
        opacity={collapsed ? 1 : 0}
        transform={collapsed ? 'translateY(0)' : 'translateY(-100%)'}
        // visibility (not just pointer-events) so the off-screen bar's
        // controls also leave the tab order — the hero carries the visible
        // pair while expanded.
        visibility={collapsed ? 'visible' : 'hidden'}
        pointerEvents={collapsed ? 'auto' : 'none'}
        transitionProperty="opacity, transform, visibility"
        transitionDuration={sdlMotion.duration.base}
        transitionTimingFunction={sdlMotion.easing.standard}
      >
        <Box
          display="flex"
          alignItems="center"
          minH={MOBILE_COLLAPSED_HEADER_H}
          w="full"
        >
          <TaskHeaderControls showBackLabel={false}>
            <Text
              as="span"
              flex="1"
              minW={0}
              fontWeight={600}
              fontSize="md"
              color="text.default"
              truncate
            >
              {headline}
            </Text>
          </TaskHeaderControls>
        </Box>
      </Box>
    </Box>
  )
}
