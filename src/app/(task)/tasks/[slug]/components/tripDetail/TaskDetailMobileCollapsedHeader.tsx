'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { LuArrowLeft, LuEllipsisVertical } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { Dropdown, IconButton } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskOverflowMenu } from './TaskOverflowMenu'
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
  const router = useRouter()
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
        pointerEvents={collapsed ? 'auto' : 'none'}
        transitionProperty="opacity, transform"
        transitionDuration={sdlMotion.duration.base}
        transitionTimingFunction={sdlMotion.easing.standard}
      >
        <HStack
          gap={2}
          align="center"
          minH={MOBILE_COLLAPSED_HEADER_H}
          w="full"
        >
          <IconButton
            type="button"
            variant="ghost"
            aria-label="Go back"
            flexShrink={0}
            onClick={() => router.back()}
          >
            <LuArrowLeft />
          </IconButton>
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
          <Dropdown
            contentLabel="Task options"
            align="end"
            trigger={
              <IconButton
                type="button"
                variant="ghost"
                aria-label="Task options"
                flexShrink={0}
              >
                <LuEllipsisVertical />
              </IconButton>
            }
          >
            <TaskOverflowMenu />
          </Dropdown>
        </HStack>
      </Box>
    </Box>
  )
}
