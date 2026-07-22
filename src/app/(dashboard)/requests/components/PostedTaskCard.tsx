'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { isTaskEditable } from '@/app/(task)/helpers/taskEditHelpers'
import {
  type TaskItem,
  formatPounds,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'
import {
  type OrderItem,
  isOrderClosed,
  taskOrderSectionHref,
} from '@/utils/orderHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, Card, Link, Thumbnail } from '@ui'

import {
  type PostedTaskStage,
  postedTaskStage,
  postedTaskStageLabel,
  postedTaskTimelineSteps,
} from '../../helpers/postedTaskCustomer'
import { PostedTaskTimeline } from './calendar/PostedTaskTimeline'

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <Box
      as="span"
      display="inline-flex"
      color="text.muted"
      transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
      transition="transform 0.15s ease"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Expand</title>
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export function PostedTaskCard({
  task,
  customerOrder,
}: {
  task: TaskItem
  customerOrder: OrderItem | null
}) {
  const [expanded, setExpanded] = useState(false)
  const stage = postedTaskStage(task, customerOrder)
  const thumbnailSrc = task.images?.[0] ?? undefined
  const hasOrder = Boolean(customerOrder)
  const orderClosed = customerOrder
    ? isOrderClosed(customerOrder.status)
    : false
  const timelineSteps = postedTaskTimelineSteps(task, customerOrder)
  const quoteCount = task.quotes?.length ?? 0
  const taskHref = `/tasks/${task.id}`

  const primaryCta =
    stage === 'quoting' && quoteCount > 0
      ? {
          label: 'Review quotes',
          href: taskHref,
          variant: 'primary' as const,
        }
      : hasOrder
        ? orderClosed
          ? {
              label: 'View order',
              href: taskOrderSectionHref(task.id),
              variant: 'primary' as const,
            }
          : {
              label: 'Manage booking',
              href: taskOrderSectionHref(task.id),
              variant: 'secondary' as const,
            }
        : {
            label: 'Open task',
            href: taskHref,
            variant: 'ghost' as const,
          }

  const summaryMeta =
    quoteCount > 0
      ? `${quoteCount} quote${quoteCount === 1 ? '' : 's'} · ${formatPounds(taskBudgetPence(task))}`
      : formatPounds(taskBudgetPence(task))

  const showSecondaryCta =
    expanded && primaryCta.href !== taskHref && primaryCta.label !== 'Open task'

  return (
    <Card layout="section" p={0} overflow="hidden">
      <Box
        as="button"
        w="full"
        textAlign="left"
        p={5}
        cursor="pointer"
        bg="transparent"
        border="none"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <HStack justify="space-between" align="flex-start" gap={3}>
          <HStack align="flex-start" gap={3} flex={1} minW={0}>
            <Thumbnail alt={`${task.title} thumbnail`} src={thumbnailSrc} />
            <Stack gap={1} minW={0}>
              <Heading size="sm" lineClamp={2}>
                {task.title}
              </Heading>
              <Text fontSize="sm" color="text.muted">
                {taskPublicLocationLabel(task) || 'Location TBC'}
              </Text>
              <Text fontSize="sm" fontWeight={600} color="text.default">
                {summaryMeta}
              </Text>
            </Stack>
          </HStack>
          <Stack align="flex-end" gap={2} flexShrink={0}>
            <StageBadge stage={stage} />
            <ChevronIcon expanded={expanded} />
          </Stack>
        </HStack>
      </Box>

      <HStack
        px={5}
        pb={4}
        pt={2}
        gap={2}
        justify="flex-end"
        flexWrap="wrap"
        borderTopWidth="1px"
        borderColor="border.default"
      >
        <Link href={taskHref} _hover={{ textDecoration: 'none' }}>
          <Button size="sm" variant="primary">
            Open task
          </Button>
        </Link>
      </HStack>

      {expanded ? (
        <Stack
          gap={4}
          px={5}
          pb={5}
          pt={0}
          borderTopWidth="1px"
          borderColor="border.default"
        >
          <PostedTaskTimeline steps={timelineSteps} />

          <HStack justify="flex-end" flexWrap="wrap" gap={2}>
            {isTaskEditable(task.status) ? (
              <Link
                href={`/tasks/${task.id}/edit`}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </Link>
            ) : null}
            {showSecondaryCta ? (
              <Link href={primaryCta.href} _hover={{ textDecoration: 'none' }}>
                <Button size="sm" variant={primaryCta.variant}>
                  {primaryCta.label}
                </Button>
              </Link>
            ) : null}
          </HStack>
        </Stack>
      ) : null}
    </Card>
  )
}

function StageBadge({ stage }: { stage: PostedTaskStage }) {
  const variant =
    stage === 'booked'
      ? 'success'
      : stage === 'cancelled'
        ? 'danger'
        : stage === 'done'
          ? 'info'
          : 'neutral'

  return (
    <Badge variant={variant} dot flexShrink={0}>
      {postedTaskStageLabel(stage)}
    </Badge>
  )
}
