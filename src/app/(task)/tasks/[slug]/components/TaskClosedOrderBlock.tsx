'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useCallback, useMemo, useRef } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { OrderJobInvoice } from '@/app/(dashboard)/components/orders/OrderJobInvoice'
import { ScheduleChip } from '@/ui/ScheduleChip'
import { formatDate } from '@/utils/dashboardHelpers'
import {
  type OrderItem,
  TASK_ORDER_SECTION_ID,
  formatOrderAgreedPrice,
  orderLocationLabel,
  orderPartyRole,
  orderSnapshotDatetime,
  orderStatusChipLabel,
  orderTimelineSteps,
  scheduleChipForOrder,
  workerQuoteForOrder,
} from '@/utils/orderHelpers'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'
import { Avatar, Badge, SectionCard } from '@ui'

import type { TaskDetailRecord } from '../helpers/taskDetailUtils'

type TaskClosedOrderBlockProps = {
  task: TaskDetailRecord
  order: OrderItem
}

export function TaskClosedOrderBlock({
  task,
  order,
}: TaskClosedOrderBlockProps) {
  const me = useUserStore((s) => s.me)

  const role = me ? orderPartyRole(order, me.id) : null

  const workerQuote = useMemo(
    () => workerQuoteForOrder(task.quotes, order.quoteId),
    [task.quotes, order.quoteId],
  )

  const workerName = workerQuote?.worker?.profile?.name?.trim() || 'Worker'
  const timeline = orderTimelineSteps(order)
  const schedule = formatTaskScheduleLabel(orderSnapshotDatetime(order))

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

  return (
    <Stack
      ref={onSectionRef}
      id={TASK_ORDER_SECTION_ID}
      scrollMarginTop="96px"
      gap={4}
      w="full"
    >
      <Heading size="md">Order details</Heading>

      <SectionCard p={5}>
        <Stack gap={4}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Text fontSize="sm" fontWeight={700} color="cardFg">
              {order.snapshot.title}
            </Text>
            <HStack gap={2}>
              <ScheduleChip chip={scheduleChipForOrder(order)} />
              <Badge bg="badgeBg" color="cardFg">
                {role === 'customer' ? 'Customer' : 'Worker'} ·{' '}
                {orderStatusChipLabel(order.status)}
              </Badge>
            </HStack>
          </HStack>

          <Stack gap={1} fontSize="sm" color="formLabelMuted">
            <Text>
              Agreed {formatOrderAgreedPrice(order)} ·{' '}
              {orderLocationLabel(order)}
            </Text>
            {schedule ? <Text>Schedule: {schedule}</Text> : null}
            <Text>
              Created {formatDate(order.createdAt)}
              {order.closedAt ? ` · Closed ${formatDate(order.closedAt)}` : ''}
            </Text>
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard p={5} eyebrow="Worker" heading={workerName} bodyGap={3}>
        <Avatar
          name={workerName}
          src={workerQuote?.worker?.profile?.avatarUrl ?? undefined}
          label={workerName}
        />
      </SectionCard>

      <SectionCard
        p={5}
        eyebrow="Progress"
        heading="Status timeline"
        bodyGap={3}
      >
        <Stack gap={0}>
          {timeline.map((step, index) => (
            <HStack
              key={step.key}
              align="flex-start"
              gap={3}
              py={2}
              borderBottomWidth={
                index < timeline.length - 1 ? '1px' : undefined
              }
              borderColor="cardBorder"
            >
              <Box
                w={2}
                h={2}
                mt={2}
                borderRadius="full"
                bg={
                  step.done
                    ? 'primary.600'
                    : step.current
                      ? 'primary.300'
                      : 'neutral.300'
                }
                flexShrink={0}
              />
              <Stack gap={0} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight={step.current ? 700 : 600}
                  color={
                    step.done || step.current ? 'cardFg' : 'formLabelMuted'
                  }
                >
                  {step.label}
                </Text>
                {step.at ? (
                  <Text fontSize="xs" color="formLabelMuted">
                    {formatDate(step.at)}
                  </Text>
                ) : null}
              </Stack>
            </HStack>
          ))}
        </Stack>
      </SectionCard>

      {role === 'customer' && order.status === OrderStatus.Closed ? (
        <SectionCard p={5} eyebrow="Records" heading="Invoice" bodyGap={3}>
          <OrderJobInvoice order={order} workerName={workerName} />
        </SectionCard>
      ) : null}
    </Stack>
  )
}
