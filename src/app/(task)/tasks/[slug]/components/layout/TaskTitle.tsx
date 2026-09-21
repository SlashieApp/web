'use client'

import { Box, HStack, Heading, Skeleton } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { TaskStatusPill } from '../ui/TaskStatusPill'
import { TaskActivityTrigger } from './TaskActivityTrigger'
import { TaskDetailMeta } from './TaskDetailMeta'
import { TaskBackButton } from './TaskHeaderControls'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

type TaskTitleProps = {
  /** When the sticky chrome is docked, compact the title row. */
  isStuck?: boolean
}

/** Matches the compact back button (44px) plus the title-row gap. */
const COMPACT_TITLE_OFFSET = 'calc(44px + 0.75rem)'

/**
 * Sticky task title. Until the chrome is stuck, the status badge sits above
 * the title as an eyebrow and the compact back control lines up with the
 * title only. Once stuck, the badge sits inline beside the title. Meta chips
 * sit under the title.
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

  const statusPill = copy ? (
    <TaskStatusPill status={copy.pill} size="sm" flexShrink={0} />
  ) : (
    <Skeleton h="22px" w="72px" borderRadius="full" flexShrink={0} />
  )

  return (
    <Box pt={2} pb={4} w="full">
      {isStuck ? null : (
        <Box mb={1} w="fit-content" pl={{ base: COMPACT_TITLE_OFFSET, lg: 0 }}>
          {statusPill}
        </Box>
      )}
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
          {isStuck ? statusPill : null}
        </HStack>
        <HStack
          display={{ base: 'flex', lg: 'none' }}
          ml="auto"
          flexShrink={0}
          gap={0}
        >
          <TaskActivityTrigger />
          <TaskHelpOverflowTrigger />
        </HStack>
      </HStack>
      <Box mt={1} minW={0} w="full">
        <TaskDetailMeta isStuck={isStuck} />
      </Box>
    </Box>
  )
}
