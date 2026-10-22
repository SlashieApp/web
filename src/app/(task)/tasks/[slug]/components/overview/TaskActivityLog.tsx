'use client'

import {
  Box,
  HStack,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import type { IconType } from 'react-icons'
import {
  LuCalendarCheck,
  LuClipboardList,
  LuMessageSquareText,
  LuStar,
} from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskActivityKind,
  type TaskActivityLine,
  formatTaskActivityTime,
  taskActivityLines,
} from '../../helpers/taskActivityLog'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import { useDateLocale } from '../summary/facts/TaskFacts'

const KIND_ICON: Record<TaskActivityKind, IconType> = {
  task: LuClipboardList,
  quote: LuMessageSquareText,
  booking: LuCalendarCheck,
  review: LuStar,
}

export type TaskActivityLogData = {
  /** The viewer's history is still loading. */
  loading: boolean
  /** One line per event, oldest first. */
  lines: TaskActivityLine[]
}

/**
 * The viewer's history of this task (FE-372), or null when there is no task
 * to show. It stays loading until the viewer is known, since who they are
 * decides how each line reads ("You booked Jordan" or "A worker was booked").
 */
export function useTaskActivityLog(): TaskActivityLogData | null {
  const { task, pending, statusReady, me, permissions } = useTaskDetail()
  const copy = useI11n(bag).activity

  if (!task) return pending ? { loading: true, lines: [] } : null
  if (!statusReady) return { loading: true, lines: [] }
  return {
    loading: false,
    lines: taskActivityLines(
      task.timeline,
      { userId: me?.id ?? null, isOwner: permissions.isOwner },
      copy,
    ),
  }
}

/** The log: one line per event, oldest first, each with when it happened. */
export function TaskActivityLog({ loading, lines }: TaskActivityLogData) {
  const a = useI11n(bag).activity
  const locale = useDateLocale()

  if (loading) {
    return (
      <Stack gap={0} aria-busy>
        <VisuallyHidden>{a.loading}</VisuallyHidden>
        {[0, 1, 2].map((row) => (
          <HStack key={row} align="flex-start" gap={3} py={3}>
            <Skeleton boxSize="32px" borderRadius="full" flexShrink={0} />
            <Stack gap={1.5} flex={1} pt={1}>
              <Skeleton
                h="calc(0.875rem * 1.5)"
                w={row === 1 ? '60%' : '80%'}
              />
              <Skeleton h="calc(0.75rem * 1.5)" w="30%" />
            </Stack>
          </HStack>
        ))}
      </Stack>
    )
  }

  if (lines.length === 0) {
    return (
      <Text fontSize="sm" color="text.muted" py={2}>
        {a.empty}
      </Text>
    )
  }

  return (
    <Stack as="ol" gap={0} m={0} p={0} listStyleType="none">
      {lines.map((line, index) => {
        const Icon = KIND_ICON[line.kind]
        return (
          <HStack
            as="li"
            key={line.key}
            align="flex-start"
            gap={3}
            py={3}
            borderBottomWidth={index < lines.length - 1 ? '1px' : 0}
            borderColor="border.default"
          >
            <Box
              aria-hidden
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="32px"
              flexShrink={0}
              borderRadius="full"
              bg="bg.subtle"
              color="text.muted"
            >
              <Icon size={16} />
            </Box>
            <Stack gap={0.5} flex={1} minW={0} pt={0.5}>
              <Text fontSize="sm" color="text.default">
                {line.text}
              </Text>
              <Text asChild fontSize="xs" color="text.muted">
                <time dateTime={line.at}>
                  {formatTaskActivityTime(line.at, locale)}
                </time>
              </Text>
            </Stack>
          </HStack>
        )
      })}
    </Stack>
  )
}

/** Desktop rail card: the log, always open. Phones open it from Overview. */
export function TaskActivityCard() {
  const log = useTaskActivityLog()
  const a = useI11n(bag).activity
  if (!log) return null

  return (
    <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={a.heading}>
      <TaskActivityLog {...log} />
    </Card>
  )
}
