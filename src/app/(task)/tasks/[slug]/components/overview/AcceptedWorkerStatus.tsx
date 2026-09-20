'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Text } from '@chakra-ui/react'
import { LuMapPin } from 'react-icons/lu'
import bag from '../../i11n.json'

import { orderSnapshotDatetime } from '@/utils/orderHelpers'
import {
  countdownToExactSchedule,
  formatTaskScheduleLabel,
} from '@/utils/taskJobSchedule'
import { Button, Card, DetailRow, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'

function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

/**
 * The worker's "Your job" booking card for an active booking: where to be +
 * contact. The complete-with-code flow lives in the quote section
 * (`WorkerOrderVerificationPanel`), not here.
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

  const poster = task.poster
  const tel = poster?.profile?.contactNumber?.trim() || null
  const mailto = poster?.email?.trim() || null

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={b.workerTitle}
      description={countdown || b.flexibleSchedule}
    >
      <DetailRow
        icon={<LuMapPin />}
        label={b.beOnSite}
        subLine={scheduleLabel || undefined}
        withDivider={false}
      >
        {address}
      </DetailRow>

      <HStack gap={2} flexWrap="wrap">
        {tel ? (
          <Link
            href={`tel:${tel.replace(/\s/g, '')}`}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant="primary">
              {b.contactCustomer}
            </Button>
          </Link>
        ) : mailto ? (
          <Link href={`mailto:${mailto}`} _hover={{ textDecoration: 'none' }}>
            <Button size="sm" variant="primary">
              {b.emailCustomer}
            </Button>
          </Link>
        ) : (
          <Link href={'/account'} _hover={{ textDecoration: 'none' }}>
            <Button size="sm" variant="secondary">
              {b.addContact}
            </Button>
          </Link>
        )}
        {hasCoords ? (
          <Link
            href={mapsDirectionsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant="secondary">
              {b.openMaps}
            </Button>
          </Link>
        ) : null}
      </HStack>

      <Text fontSize="sm" color="text.muted" lineHeight="short">
        {b.paymentNote}
      </Text>
      <SafetyNotice variant="inline" />
    </Card>
  )
}
