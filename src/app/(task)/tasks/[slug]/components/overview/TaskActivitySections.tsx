'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formatDate } from '@/utils/dashboardHelpers'
import { Card } from '@ui'

import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'
import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskActivityStep,
  buildTaskActivitySteps,
} from '../../helpers/taskDetailActivity'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'

/** The lifecycle steps (posted, quotes, booked, done), or null before load. */
export function useActivitySteps(): TaskActivityStep[] | null {
  const { task, myOrder, permissions } = useTaskDetail()
  const a = useI11n(bag).activity

  if (!task) return null

  const quoteCount = task.quotes.length
  const quotesLabel =
    quoteCount === 0
      ? a.waitingQuotes
      : quoteCount === 1
        ? a.quotesOne
        : formatMessage(a.quotesMany, { count: quoteCount })
  const awarded = task.quotes.find((q) => isAcceptedQuoteStatus(q.status))
  const workerName = awarded?.worker?.profile?.name?.trim()
  const bookedLabel = workerName
    ? formatMessage(a.bookedNamed, { name: workerName })
    : a.booked

  return buildTaskActivitySteps(task, myOrder, permissions, {
    posted: a.posted,
    postedDetail: a.postedDetail,
    quotesLabel,
    quotesDetail: permissions.isOpen
      ? a.quotesDetail
      : quoteCount > 0
        ? a.quotesReceived
        : undefined,
    bookedLabel,
    bookedActive: a.bookedActive,
    completed: a.completed,
    cancelled: a.cancelled,
  })
}

export function ActivitySteps({ steps }: { steps: TaskActivityStep[] }) {
  return (
    <Stack gap={0} w="full">
      {steps.map((step, index) => (
        <HStack
          key={step.key}
          align="flex-start"
          gap={3}
          py={2}
          borderBottomWidth={index < steps.length - 1 ? '1px' : undefined}
          borderColor="border.default"
        >
          <Box
            w={2}
            h={2}
            mt={2}
            borderRadius="full"
            bg={
              step.done
                ? 'action.primary'
                : step.current
                  ? 'status.success.solid'
                  : 'neutral.300'
            }
            flexShrink={0}
          />
          <Stack gap={0} flex={1} minW={0}>
            <Text
              fontSize="sm"
              fontWeight={step.current ? 700 : 600}
              color={step.done || step.current ? 'text.default' : 'text.muted'}
            >
              {step.label}
            </Text>
            {step.detail ? (
              <Text fontSize="xs" color="text.muted">
                {step.detail}
              </Text>
            ) : null}
            {step.at ? (
              <Text fontSize="xs" color="text.muted">
                {formatDate(step.at)}
              </Text>
            ) : null}
          </Stack>
        </HStack>
      ))}
    </Stack>
  )
}

/** Desktop rail card: the lifecycle strip, always open. */
export function TaskActivitySections() {
  const steps = useActivitySteps()
  const a = useI11n(bag).activity
  if (!steps) return null

  return (
    <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={a.heading}>
      <ActivitySteps steps={steps} />
    </Card>
  )
}
