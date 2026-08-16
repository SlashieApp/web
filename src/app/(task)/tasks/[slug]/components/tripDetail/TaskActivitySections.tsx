'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Stack, Text } from '@chakra-ui/react'
import bag from '../../i11n.json'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskActivityEvent,
  buildTaskActivityEvents,
} from '../../helpers/taskDetailActivity'

function formatActivityTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type ActivityCopy = {
  someone: string
  quoteCreated: string
  quoteAccepted: string
  quoteDeclined: string
  quoteWithdrawn: string
  orderCreated: string
  orderWorkCompleted: string
  orderPaymentAcknowledged: string
  orderClosed: string
  orderCancelled: string
}

function activityLabel(event: TaskActivityEvent, copy: ActivityCopy): string {
  const name = event.actorName?.trim() || copy.someone
  switch (event.kind) {
    case 'quoteCreated':
      return formatMessage(copy.quoteCreated, { name })
    case 'quoteAccepted':
      return formatMessage(copy.quoteAccepted, { name })
    case 'quoteDeclined':
      return formatMessage(copy.quoteDeclined, { name })
    case 'quoteWithdrawn':
      return formatMessage(copy.quoteWithdrawn, { name })
    case 'orderCreated':
      return copy.orderCreated
    case 'orderWorkCompleted':
      return copy.orderWorkCompleted
    case 'orderPaymentAcknowledged':
      return copy.orderPaymentAcknowledged
    case 'orderClosed':
      return copy.orderClosed
    case 'orderCancelled':
      return copy.orderCancelled
    default:
      return copy.someone
  }
}

/**
 * Lightweight activity timeline from quotes + orders already on the task.
 * Empty when the viewer has nothing to show (typical for guests).
 */
export function TaskActivitySections() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return null

  const events = buildTaskActivityEvents({
    quotes: task.quotes,
    orders: task.orders ?? [],
  })

  if (events.length === 0) {
    return (
      <Card layout="section">
        <Stack gap={1}>
          <Text fontWeight={600} color="text.default">
            {t.activity.emptyTitle}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {t.activity.emptyCaption}
          </Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack gap={0} w="full" minW={0} pointerEvents="auto">
      {events.map((event, index) => (
        <Box
          key={event.id}
          py={3}
          borderBottomWidth={index < events.length - 1 ? '1px' : '0'}
          borderColor="border.default"
        >
          <Text fontSize="sm" fontWeight={600} color="text.default">
            {activityLabel(event, t.activity)}
          </Text>
          <Text fontSize="xs" color="text.muted" mt={0.5}>
            {formatActivityTime(event.at)}
          </Text>
        </Box>
      ))}
    </Stack>
  )
}
