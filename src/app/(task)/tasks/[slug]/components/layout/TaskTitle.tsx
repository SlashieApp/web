'use client'

import { Box, HStack, Heading, Skeleton } from '@chakra-ui/react'

import { sdlMotion } from '@/theme/styles'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskDetailMeta } from './TaskDetailMeta'
import { TaskBackButton } from './TaskHeaderControls'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'

type TaskTitleProps = {
  /** When the sticky chrome is docked, compact the title row. */
  isStuck?: boolean
}

/**
 * Sticky task title with the compact back control, then the meta chips. The
 * status badge is the Task summary's eyebrow, not here.
 */
export function TaskTitle({ isStuck = false }: TaskTitleProps) {
  const { task, seed, pending } = useTaskDetail()

  if (!task && !pending && !seed) return null

  const title = task?.title?.trim() || seed?.title?.trim() || ''

  return (
    <Box pt={2} pb={4} w="full">
      <HStack
        gap={3}
        align="center"
        minW={0}
        w="full"
        minH={isStuck ? '44px' : { base: '44px', lg: '52px' }}
        pl={{ base: 0, lg: isStuck ? 14 : 0 }}
        transitionProperty="padding"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
      >
        <Box display={{ base: 'block', lg: 'none' }} flexShrink={0}>
          <TaskBackButton />
        </Box>
        <HStack flex="1 1 auto" minW={0} gap={3} align="center">
          <Heading
            as="h1"
            flex="0 1 auto"
            minW={0}
            fontFamily="heading"
            fontSize={
              isStuck ? { base: 'md', md: 'lg' } : { base: '2xl', lg: '4xl' }
            }
            fontWeight={isStuck ? 600 : 700}
            lineHeight={isStuck ? '1.3' : { base: '1.25', lg: '1.15' }}
            color="text.default"
            truncate={isStuck}
            whiteSpace={isStuck ? 'nowrap' : 'normal'}
            transitionProperty="font-size, font-weight, line-height"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
          >
            {title || <Skeleton as="span" h="20px" w="55%" borderRadius="md" />}
          </Heading>
        </HStack>
        <HStack
          display={{ base: 'flex', lg: 'none' }}
          ml="auto"
          flexShrink={0}
          gap={0}
        >
          <TaskHelpOverflowTrigger />
        </HStack>
      </HStack>
      <Box mt={1} minW={0} w="full">
        <TaskDetailMeta isStuck={isStuck} />
      </Box>
    </Box>
  )
}
