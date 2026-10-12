'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'
import bag from '../../i11n.json'

import {
  formatOrderAgreedPrice,
  orderBookedDatetime,
  orderLocationLabel,
} from '@/utils/orderHelpers'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'
import {
  LuCalendar,
  LuCreditCard,
  LuListChecks,
  LuMapPin,
  LuUser,
} from 'react-icons/lu'

import { Avatar, Card, DetailRow, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import { formatTaskBudgetPaymentMethodLabel } from '../../helpers/taskDetailUtils'
import { AgreementTotal } from './AgreementTotal'
import { OrderProgressPanel } from './OrderProgressPanel'

/** Owner's booking: who, when, where, and the booking's progress. */
export function CustomerActiveOrderStatus() {
  const { task, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const b = t.booking

  if (
    !task ||
    !myOrder ||
    !permissions.isOwner ||
    !permissions.showOrderActions
  )
    return null

  const quote =
    task.quotes.find((q) => q.id === myOrder.quoteId) ??
    task.quotes.find((q) => q.status === QuoteStatus.Accepted)
  const workerName =
    quote?.worker?.profile?.name?.trim() || b.yourWorkerFallback
  const workerAvatar = quote?.worker?.profile?.avatarUrl ?? undefined
  const schedule = formatTaskScheduleLabel(orderBookedDatetime(myOrder))
  const location = orderLocationLabel(myOrder)
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
      <DetailRow
        icon={<LuListChecks />}
        label={b.whatsNext}
        withDivider={false}
      >
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
      <OrderProgressPanel />
    </Card>
  )
}
