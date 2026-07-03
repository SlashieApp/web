'use client'

import type { ReactNode } from 'react'

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
import { Avatar } from '@ui'

import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { IconWrench } from '../metaSection/VisitorMetaIcons'

type OrderSectionProps = {
  task: TaskDetailRecord
  order: OrderItem
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Worker</title>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 20c1.5-3.5 4.5-5.5 7-5.5s5.5 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
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

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Information</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 11v5M12 8h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

function OrderWorkerRow({
  workerName,
  avatarUrl,
}: {
  workerName: string
  avatarUrl?: string | null
}) {
  return (
    <HStack
      align="center"
      gap={3}
      py={3}
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <Flex
        w="9"
        h="9"
        align="center"
        justify="center"
        borderRadius="full"
        bg="status.success.soft"
        color="status.success.fg"
        flexShrink={0}
      >
        <IconUser />
      </Flex>
      <Text
        fontSize="sm"
        fontWeight={600}
        color="text.muted"
        flexShrink={0}
        minW={{ base: '4.5rem', sm: '5.5rem' }}
      >
        Worker
      </Text>
      <HStack gap={2} flex={1} minW={0}>
        <Avatar name={workerName} src={avatarUrl ?? undefined} />
        <Text fontSize="sm" fontWeight={600} color="text.default">
          {workerName}
        </Text>
      </HStack>
    </HStack>
  )
}

export function OrderSection({ task, order }: OrderSectionProps) {
  if (!isOrderClosed(order.status)) return null

  const workerQuote = useMemo(
    () => workerQuoteForOrder(task.quotes, order.quoteId),
    [task.quotes, order.quoteId],
  )
  const workerName = workerQuote?.worker?.profile?.name?.trim() || 'Worker'
  const workerAvatarUrl = workerQuote?.worker?.profile?.avatarUrl

  const timeline = orderTimelineSteps(order)
  const agreedPrice = formatOrderAgreedPrice(order)
  const statusLabel = orderStatusChipLabel(order.status)
  // A closed (not cancelled) order means the worker entered the customer's
  // completion code and the job is done + paid.
  const completed = order.status === OrderStatus.Closed

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
    <Box
      ref={onSectionRef}
      id={TASK_ORDER_SECTION_ID}
      w="full"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      overflow="hidden"
      boxShadow="sm"
    >
      <Stack gap={0}>
        {completed ? (
          <HStack
            align="flex-start"
            gap={3}
            px={{ base: 4, md: 5 }}
            pt={5}
            pb={1}
          >
            <Flex
              w="10"
              h="10"
              align="center"
              justify="center"
              borderRadius="full"
              bg="status.success.solid"
              color="text.onGreen"
              flexShrink={0}
            >
              <IconWorkCompleted />
            </Flex>
            <Stack gap={0.5} flex={1} minW={0}>
              <Text
                fontWeight={700}
                fontSize={{ base: 'md', md: 'lg' }}
                color="text.default"
              >
                Task completed
              </Text>
              <Text fontSize="sm" color="text.muted">
                The job is done and payment is settled directly between you.
                This task is now closed, and the summary below is for your
                records.
              </Text>
            </Stack>
          </HStack>
        ) : null}
        <Box px={{ base: 4, md: 5 }} pt={completed ? 3 : 5} pb={2}>
          <HStack justify="space-between" align="center" gap={3}>
            <Text
              fontSize="xs"
              fontWeight={700}
              letterSpacing="0.06em"
              textTransform="uppercase"
              color="text.muted"
            >
              Order summary
            </Text>
            <OrderStatusBadge label={statusLabel} />
          </HStack>
        </Box>

        <Box px={{ base: 4, md: 5 }} pb={4}>
          <OrderWorkerRow workerName={workerName} avatarUrl={workerAvatarUrl} />
          <HStack
            justify="space-between"
            align="center"
            px={4}
            py={3.5}
            borderRadius="lg"
            bg="status.success.soft"
          >
            <Text fontSize="sm" fontWeight={700} color="status.success.fg">
              Agreed total
            </Text>
            <Text
              fontSize="2xl"
              fontWeight={700}
              color="status.success.fg"
              lineHeight="1"
            >
              {agreedPrice}
            </Text>
          </HStack>
        </Box>

        <Box px={{ base: 4, md: 5 }} pb={4}>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="text.muted"
            mb={3}
          >
            Timeline
          </Text>
          <OrderRecordTimeline steps={timeline} />
        </Box>

        <HStack
          align="flex-start"
          gap={3}
          mx={{ base: 4, md: 5 }}
          mb={5}
          px={4}
          py={3.5}
          borderRadius="lg"
          bg="bg.subtle"
        >
          <Flex
            w="8"
            h="8"
            align="center"
            justify="center"
            borderRadius="full"
            bg="bg.surface"
            color="text.muted"
            flexShrink={0}
          >
            <IconInfo />
          </Flex>
          <Text fontSize="xs" color="text.muted" lineHeight="relaxed">
            This record is for your files only. Slashie does not process
            payments between customers and workers — settle payment directly
            with each other. This is not a tax invoice or platform receipt.
          </Text>
        </HStack>
      </Stack>
    </Box>
  )
}
