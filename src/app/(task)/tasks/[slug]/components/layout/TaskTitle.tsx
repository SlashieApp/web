'use client'

import { Box, HStack, Heading, Skeleton } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { TaskStatusPill } from '../ui/TaskStatusPill'
import { TaskBackButton } from './TaskHeaderControls'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

type TaskTitleProps = {
  /** When the sticky chrome is docked, compact the title row. */
  isStuck?: boolean
}

/**
 * Sticky task title + status badge. Compact viewports also get the
 * options overflow on the right of this row.
 */
export function TaskTitle({ isStuck = false }: TaskTitleProps) {
  const {
    task,
    seed,
    pending,
    permissions,
    statusReady,
    myQuote,
    isAuthenticated,
  } = useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending && !seed) return null

  const title = task?.title?.trim() || seed?.title?.trim() || ''
  const copy =
    statusReady && task
      ? selectStatusHeaderCopy(
          { permissions, myQuote, isAuthenticated, task },
          t.statusHeader,
        )
      : null

  return (
    <Box pt={2} pb={isStuck ? 1 : { base: 1, lg: 6 }} w="full">
      <HStack
        gap={3}
        align={isStuck ? 'center' : { base: 'center', lg: 'flex-end' }}
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
        {copy ? (
          <TaskStatusPill status={copy.pill} size="sm" flexShrink={0} />
        ) : (
          <Skeleton h="22px" w="72px" borderRadius="full" flexShrink={0} />
        )}
        <Box display={{ base: 'block', lg: 'none' }} ml="auto" flexShrink={0}>
          <TaskHelpOverflowTrigger />
        </Box>
      </HStack>
    </Box>
  )
}
