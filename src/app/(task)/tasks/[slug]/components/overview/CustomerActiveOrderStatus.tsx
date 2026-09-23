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
import {
  LuCalendar,
  LuCreditCard,
  LuKeyRound,
  LuMapPin,
  LuUser,
} from 'react-icons/lu'

import { Avatar, Button, Card, DetailRow, IconButton, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import { formatTaskBudgetPaymentMethodLabel } from '../../helpers/taskDetailUtils'
import { AgreementTotal } from './AgreementTotal'

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
  const location = orderLocationLabel(myOrder)
  const code = myOrder.completionVerificationCode?.trim() ?? ''
  const payment = myOrder.snapshot.paymentMethod?.trim()
  const paymentLabel = payment
    ? formatTaskBudgetPaymentMethodLabel(payment)
    : null

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={b.customerEyebrow}
      heading={b.customerTitle}
      metric={
        <AgreementTotal
          label={t.order.agreedTotal}
          amount={formatOrderAgreedPrice(myOrder)}
        />
      }
    >
      <DetailRow icon={<LuUser />} label={b.yourWorker} withDivider>
        <HStack gap={2} align="center">
          <Avatar name={workerName} src={workerAvatar} />
          <Text as="span">{workerName}</Text>
        </HStack>
      </DetailRow>
      {schedule ? (
        <DetailRow icon={<LuCalendar />} label={b.schedule} withDivider>
          {schedule}
        </DetailRow>
      ) : null}
      <DetailRow icon={<LuMapPin />} label={t.details.location} withDivider>
        {location}
      </DetailRow>
      {paymentLabel ? (
        <DetailRow
          icon={<LuCreditCard />}
          label={t.details.payment}
          withDivider={false}
        >
          {paymentLabel}
        </DetailRow>
      ) : null}
      <DetailRow icon={<LuKeyRound />} label={b.whatsNext} withDivider={false}>
        <Stack gap={1}>
          <Text fontSize="sm" fontWeight={400} color="text.muted">
            {b.step1}
          </Text>
          <Text fontSize="sm" fontWeight={400} color="text.muted">
            {b.step2}
          </Text>
          <Text fontSize="sm" fontWeight={400} color="text.muted">
            {b.step3}
          </Text>
        </Stack>
      </DetailRow>
      <SafetyNotice variant="inline" />
      {code ? (
        <Stack gap={2}>
          <DetailRow
            icon={<LuKeyRound />}
            label={b.completionCode}
            withDivider={false}
          >
            <HStack gap={2}>
              <Text
                fontFamily="mono"
                fontSize="lg"
                fontWeight={700}
                letterSpacing="0.16em"
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
          </DetailRow>
          <Text fontSize="sm" color="text.muted">
            {b.codePrivateHint}
          </Text>
          <Button
            type="button"
            variant="secondary"
            w="full"
            onClick={() => void copyCode(code)}
          >
            {t.cta.confirm}
          </Button>
        </Stack>
      ) : (
        <Text fontSize="sm" color="text.muted">
          {b.codePending}
        </Text>
      )}
    </Card>
  )
}
