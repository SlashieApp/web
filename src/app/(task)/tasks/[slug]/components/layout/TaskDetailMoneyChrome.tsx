'use client'

import { Box, HStack, Heading, Skeleton, Stack } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { TaskStatusPill } from '../ui/TaskStatusPill'
import { TaskBackButton } from './TaskHeaderControls'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

type TaskDetailMoneyChromeProps = {
  /** When the sticky chrome is docked, indent for the floating back button. */
  isStuck?: boolean
}

/**
 * Sticky money context: one title heading + status tag.
 * Title is large until the chrome docks; StatusHeader owns the compact fade.
 */
export function TaskDetailMoneyChrome({
  isStuck = false,
}: TaskDetailMoneyChromeProps) {
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
    <Box pt={2} pb={1} w="full">
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
      </HStack>
    </Box>
  )
}

/** Role-aware status line for the Overview tab, with mobile overflow on the right. */
export function TaskDetailStatusCallout() {
  const { task, permissions, myQuote, isAuthenticated, statusReady } =
    useTaskDetail()
  const t = useI11n(bag)

  if (!statusReady || !task) return null

  const copy = selectStatusHeaderCopy(
    { permissions, myQuote, isAuthenticated, task },
    t.statusHeader,
  )

  return (
    <HStack align="flex-start" gap={2} w="full">
      <Stack gap={1} flex={1} minW={0}>
        <Box
          as="h2"
          fontWeight={700}
          fontSize="lg"
          color="text.default"
          lineHeight="short"
        >
          {copy.headline}
        </Box>
        <Box fontSize="sm" color="text.muted" lineHeight="short">
          {copy.subtext}
        </Box>
      </Stack>
      <Box display={{ base: 'block', lg: 'none' }} flexShrink={0}>
        <TaskHelpOverflowTrigger />
      </Box>
    </HStack>
  )
}
