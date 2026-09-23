'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack, Text } from '@chakra-ui/react'
import { LuCalendar, LuCreditCard, LuMapPin, LuUser } from 'react-icons/lu'
import bag from '../../i11n.json'

import {
  formatOrderAgreedPrice,
  orderSnapshotDatetime,
} from '@/utils/orderHelpers'
import {
  countdownToExactSchedule,
  formatTaskScheduleLabel,
} from '@/utils/taskJobSchedule'
import { Card, DetailRow, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import { formatTaskBudgetPaymentMethodLabel } from '../../helpers/taskDetailUtils'
import { AgreementTotal } from './AgreementTotal'
import { WorkerOrderVerificationPanel } from './WorkerOrderVerificationPanel'

function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

/**
 * Worker's booking invoice for an active order: agreed total, where to be,
 * and complete-job as the secondary action. Contact stays the page primary CTA.
 */
export function AcceptedWorkerStatus() {
  const { task, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const b = t.booking

  if (!task || !myOrder || !permissions.showWorkerJobBanner) return null

  const snapshot = myOrder.snapshot
  const address =
    snapshot.location?.address?.trim() ||
    snapshot.location?.name?.trim() ||
    b.addressFallback
  const datetime = orderSnapshotDatetime(myOrder)
  const scheduleLabel = formatTaskScheduleLabel(datetime)
  const countdown = countdownToExactSchedule(datetime)
  const lat = snapshot.location?.lat
  const lng = snapshot.location?.lng
  const hasCoords =
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    typeof lng === 'number' &&
    Number.isFinite(lng)
  const payment = snapshot.paymentMethod?.trim()
  const paymentLabel = payment
    ? formatTaskBudgetPaymentMethodLabel(payment)
    : null
  const customerName = task.poster?.profile?.name?.trim() || t.fallbackCustomer

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      id="worker-job-panel"
      scrollMarginTop="140px"
      eyebrow={b.workerEyebrow}
      heading={b.workerTitle}
      description={countdown || b.flexibleSchedule}
      metric={
        <AgreementTotal
          label={t.order.agreedTotal}
          amount={formatOrderAgreedPrice(myOrder)}
        />
      }
    >
      <DetailRow icon={<LuUser />} label={t.quotes.customerLabel} withDivider>
        {customerName}
      </DetailRow>
      <DetailRow icon={<LuCalendar />} label={b.schedule} withDivider>
        {scheduleLabel || b.flexibleSchedule}
      </DetailRow>
      <DetailRow icon={<LuMapPin />} label={b.beOnSite} withDivider>
        <Stack gap={1} align="flex-start">
          <Text>{address}</Text>
          {hasCoords ? (
            <Link
              href={mapsDirectionsUrl(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="sm"
            >
              {b.openMaps}
            </Link>
          ) : null}
        </Stack>
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

      <Text fontSize="sm" color="text.muted" lineHeight="short">
        {b.paymentNote}
      </Text>
      <WorkerOrderVerificationPanel embedded />
    </Card>
  )
}
