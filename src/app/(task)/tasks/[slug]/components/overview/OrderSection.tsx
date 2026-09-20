'use client'

import { useI11n } from '@/i18n/useI11n'
import type { ReactNode } from 'react'
import bag from '../../i11n.json'

import { Box, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useCallback, useMemo, useRef } from 'react'

import { formatDate } from '@/utils/dashboardHelpers'
import {
  type OrderItem,
  type OrderTimelineStep,
  TASK_ORDER_SECTION_ID,
  formatOrderAgreedPrice,
  isOrderClosed,
  orderStatusChipLabel,
  orderTimelineSteps,
  workerQuoteForOrder,
} from '@/utils/orderHelpers'
import { LuUser } from 'react-icons/lu'

import { Avatar, Card, DetailRow, SafetyNotice } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'

import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'

type OrderSectionProps = {
  task: TaskDetailRecord
  order: OrderItem
}

function IconRailCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Complete</title>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconWorkCompleted() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Work completed</title>
      <path
        d="M9 11l2 2 4-4M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Order closed</title>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Order created</title>
      <path
        d="M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 4v4h4M10 13h6M10 17h4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Payment acknowledged</title>
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconWrench() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Tools</title>
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const TIMELINE_STEP_ICONS: Record<string, () => ReactNode> = {
  created: IconDocument,
  active: IconWrench,
  'work-completed': IconWorkCompleted,
  payment: IconCard,
  closed: IconLock,
  cancelled: IconLock,
}

const RAIL_COLUMN_W = 28
const RAIL_DOT_SIZE = 20

function OrderStatusBadge({ label }: { label: string }) {
  return (
    <HStack
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      flexShrink={0}
    >
      <Box color="status.success.fg" display="flex" alignItems="center">
        <IconRailCheck />
      </Box>
      <Text fontSize="sm" fontWeight={700}>
        {label}
      </Text>
    </HStack>
  )
}

function OrderRecordTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <Stack gap={0}>
      {steps.map((step, index) => {
        const StepIcon = TIMELINE_STEP_ICONS[step.key] ?? IconDocument
        const complete = step.done
        const isFirst = index === 0
        const isLast = index === steps.length - 1

        return (
          <HStack
            key={step.key}
            align="center"
            gap={3}
            minH="3.75rem"
            position="relative"
          >
            <Box
              w={`${RAIL_COLUMN_W}px`}
              flexShrink={0}
              alignSelf="stretch"
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {!isFirst ? (
                <Box
                  position="absolute"
                  top={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="2px"
                  h="50%"
                  bg="status.success.soft"
                  aria-hidden
                />
              ) : null}
              {!isLast ? (
                <Box
                  position="absolute"
                  bottom={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="2px"
                  h="50%"
                  bg="status.success.soft"
                  aria-hidden
                />
              ) : null}
              <Flex
                w={`${RAIL_DOT_SIZE}px`}
                h={`${RAIL_DOT_SIZE}px`}
                align="center"
                justify="center"
                borderRadius="full"
                bg={complete ? 'action.primary' : 'bg.surface'}
                borderWidth="2px"
                borderColor={complete ? 'action.primary' : 'border.default'}
                color="text.onGreen"
                flexShrink={0}
                zIndex={1}
                lineHeight={0}
              >
                {complete ? <IconRailCheck /> : null}
              </Flex>
            </Box>
            <Flex
              w="10"
              h="10"
              align="center"
              justify="center"
              borderRadius="full"
              bg="status.success.soft"
              color="status.success.fg"
              flexShrink={0}
            >
              <StepIcon />
            </Flex>
            <Stack gap={0.5} flex={1} minW={0}>
              <Text fontSize="sm" fontWeight={700} color="text.default">
                {step.label}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {step.at ? formatDate(step.at) : '—'}
              </Text>
            </Stack>
          </HStack>
        )
      })}
    </Stack>
  )
}

export function OrderSection({ task, order }: OrderSectionProps) {
  const t = useI11n(bag)
  const o = t.order

  const workerQuote = useMemo(
    () => workerQuoteForOrder(task.quotes, order.quoteId),
    [task.quotes, order.quoteId],
  )
  const workerName =
    workerQuote?.worker?.profile?.name?.trim() || t.fallbackWorker
  const workerAvatarUrl = workerQuote?.worker?.profile?.avatarUrl

  const timeline = orderTimelineSteps(order)
  const agreedPrice = formatOrderAgreedPrice(order)
  const statusLabel = orderStatusChipLabel(order.status)
  // A closed (not cancelled) order means the worker entered the customer's
  // completion code and the job is done + paid.
  const completed = order.status === OrderStatus.Closed
  const closed = isOrderClosed(order.status)

  const scrolledToHashRef = useRef(false)

  const onSectionRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || scrolledToHashRef.current) return
    if (
      typeof window !== 'undefined' &&
      window.location.hash === `#${TASK_ORDER_SECTION_ID}`
    ) {
      scrolledToHashRef.current = true
      node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (!closed) return null

  return (
    <Card
      ref={onSectionRef}
      id={TASK_ORDER_SECTION_ID}
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={completed ? o.completed : o.summary}
      description={completed ? o.completedBody : undefined}
      headingAccessory={<OrderStatusBadge label={statusLabel} />}
      metric={agreedPrice}
    >
      <DetailRow icon={<LuUser />} label={o.worker} withDivider={false}>
        <HStack gap={2} align="center">
          <Avatar name={workerName} src={workerAvatarUrl ?? undefined} />
          <Text as="span">{workerName}</Text>
        </HStack>
      </DetailRow>
      <Text fontSize="sm" fontWeight={500} color="text.muted">
        {o.timeline}
      </Text>
      <OrderRecordTimeline steps={timeline} />
      <Text fontSize="sm" color="text.muted" lineHeight="short">
        {o.disclaimer}
      </Text>
      <SafetyNotice variant="inline" />
    </Card>
  )
}
