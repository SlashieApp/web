'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'
import { useCallback } from 'react'
import bag from '../../i11n.json'

import { showAppToast } from '@/utils/appToast'
import {
  formatOrderAgreedPrice,
  orderLocationLabel,
  orderSnapshotDatetime,
} from '@/utils/orderHelpers'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'
import { Avatar, Button, Card, IconButton } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

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

export function CustomerActiveOrderStatus() {
  const { task, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const b = t.booking

  const copyCode = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code)
        showAppToast({
          title: b.codeCopiedTitle,
          description: b.codeCopiedDescription,
          type: 'success',
        })
      } catch {
        showAppToast({
          title: b.codeCopyFailedTitle,
          description: b.codeCopyFailedDescription,
          type: 'error',
        })
      }
    },
    [b],
  )

  if (!task || !myOrder || !permissions.showCustomerCompletionCode) return null

  const quote =
    task.quotes.find((q) => q.id === myOrder.quoteId) ??
    task.quotes.find((q) => q.status === QuoteStatus.Accepted)
  const workerName =
    quote?.worker?.profile?.name?.trim() || b.yourWorkerFallback
  const workerAvatar = quote?.worker?.profile?.avatarUrl ?? undefined
  const schedule = formatTaskScheduleLabel(orderSnapshotDatetime(myOrder))
  const code = myOrder.completionVerificationCode?.trim() ?? ''

  return (
    <Card layout="default" maxW="full" w="full" px={{ base: 4, md: 5 }} py={4}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="status.success.fg"
            letterSpacing="0.04em"
          >
            {b.customerEyebrow}
          </Text>
          <Text
            fontWeight={700}
            fontSize={{ base: 'lg', md: 'xl' }}
            color="text.default"
          >
            {b.customerTitle}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {formatOrderAgreedPrice(myOrder)} agreed ·{' '}
            {orderLocationLabel(myOrder)}
          </Text>
        </Stack>

        <HStack gap={3} align="center">
          <Avatar name={workerName} src={workerAvatar} />
          <Stack gap={0}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {b.yourWorker}
            </Text>
            <Text fontWeight={700}>{workerName}</Text>
          </Stack>
        </HStack>

        {schedule ? (
          <Stack gap={1}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {b.schedule}
            </Text>
            <Text fontSize="sm" fontWeight={600}>
              {schedule}
            </Text>
          </Stack>
        ) : null}

        <Stack gap={2}>
          <Text fontSize="xs" fontWeight={700} color="text.muted">
            {b.whatsNext}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {b.step1}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {b.step2}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {b.step3}
          </Text>
        </Stack>

        {code ? (
          <Stack gap={2}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {b.completionCode}
            </Text>
            <HStack gap={2}>
              <Text
                fontFamily="mono"
                fontSize="2xl"
                fontWeight={700}
                letterSpacing="0.2em"
                color="text.default"
              >
                {code}
              </Text>
              <IconButton
                type="button"
                aria-label={b.copyCodeAria}
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
              {b.copyCode}
            </Button>
            <Text fontSize="xs" color="text.muted">
              {b.codePrivateHint}
            </Text>
          </Stack>
        ) : (
          <Text fontSize="sm" color="text.muted">
            {b.codePending}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
