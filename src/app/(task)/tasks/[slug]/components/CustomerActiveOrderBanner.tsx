'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { OrderStatus, QuoteStatus } from '@codegen/schema'
import { type ReactNode, useCallback } from 'react'

import { OrderJobInvoice } from '@/app/(dashboard)/components/orders/OrderJobInvoice'
import { showAppToast } from '@/utils/appToast'
import {
  formatOrderAgreedPrice,
  orderLocationLabel,
  orderSnapshotDatetime,
} from '@/utils/orderHelpers'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'
import { Avatar, Button, IconButton } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Copy</title>
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function CustomerActiveOrderBanner() {
  const { task, myOrder, isOrderCustomer } = useTaskDetail()

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      showAppToast({
        title: 'Code copied',
        description:
          'Share this 6-digit code with your worker when the job is done.',
        type: 'success',
      })
    } catch {
      showAppToast({
        title: 'Could not copy',
        description: 'Select and copy the code manually.',
        type: 'error',
      })
    }
  }, [])

  if (!task || !myOrder || !isOrderCustomer) return null

  const status = myOrder.status
  if (status === OrderStatus.Cancelled) return null

  if (status === OrderStatus.Closed) {
    const quote =
      task.quotes.find((q) => q.id === myOrder.quoteId) ??
      task.quotes.find((q) => q.status === QuoteStatus.Accepted)
    const workerName = quote?.worker?.profile?.name?.trim() || 'Your worker'
    return (
      <SectionCardWrap>
        <OrderJobInvoice order={myOrder} workerName={workerName} />
      </SectionCardWrap>
    )
  }

  if (status !== OrderStatus.Active) return null

  const quote =
    task.quotes.find((q) => q.id === myOrder.quoteId) ??
    task.quotes.find((q) => q.status === QuoteStatus.Accepted)
  const workerName = quote?.worker?.profile?.name?.trim() || 'Your worker'
  const workerAvatar = quote?.worker?.profile?.avatarUrl ?? undefined
  const schedule = formatTaskScheduleLabel(orderSnapshotDatetime(myOrder))
  const code = myOrder.completionVerificationCode?.trim() ?? ''

  return (
    <Box
      w="full"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="primary.200"
      bg="primary.50"
      px={{ base: 4, md: 5 }}
      py={4}
      boxShadow="sm"
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="primary.800"
            letterSpacing="0.04em"
          >
            YOUR BOOKING
          </Text>
          <Text
            fontWeight={800}
            fontSize={{ base: 'md', md: 'lg' }}
            color="cardFg"
          >
            Job in progress
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            {formatOrderAgreedPrice(myOrder)} agreed ·{' '}
            {orderLocationLabel(myOrder)}
          </Text>
        </Stack>

        <HStack gap={3} align="center">
          <Avatar name={workerName} src={workerAvatar} />
          <Stack gap={0}>
            <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
              Your worker
            </Text>
            <Text fontWeight={700}>{workerName}</Text>
          </Stack>
        </HStack>

        {schedule ? (
          <Stack gap={1}>
            <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
              Schedule
            </Text>
            <Text fontSize="sm" fontWeight={600}>
              {schedule}
            </Text>
          </Stack>
        ) : null}

        <Stack gap={2}>
          <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
            What&apos;s next
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            1. Coordinate on site with your worker.
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            2. Pay them directly when you agree (outside Slashie).
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            3. When satisfied, give them the completion code below so they can
            close the job on Slashie.
          </Text>
        </Stack>

        {code ? (
          <Stack gap={2}>
            <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
              Completion code
            </Text>
            <HStack gap={2}>
              <Text
                fontFamily="mono"
                fontSize="2xl"
                fontWeight={800}
                letterSpacing="0.2em"
                color="primary.800"
              >
                {code}
              </Text>
              <IconButton
                type="button"
                aria-label="Copy completion code"
                size="sm"
                variant="ghost"
                onClick={() => void copyCode(code)}
              >
                <CopyIcon />
              </IconButton>
            </HStack>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              w="fit-content"
              onClick={() => void copyCode(code)}
            >
              Copy code
            </Button>
            <Text fontSize="xs" color="formLabelMuted">
              Only you can see this code. Do not share it until the work is
              done.
            </Text>
          </Stack>
        ) : (
          <Text fontSize="sm" color="formLabelMuted">
            Your completion code will appear here shortly.
          </Text>
        )}
      </Stack>
    </Box>
  )
}

function SectionCardWrap({ children }: { children: ReactNode }) {
  return (
    <Box
      w="full"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="cardBorder"
      bg="cardBg"
      px={{ base: 4, md: 5 }}
      py={4}
    >
      {children}
    </Box>
  )
}
